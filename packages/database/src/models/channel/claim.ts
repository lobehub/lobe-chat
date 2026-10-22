import type { ChannelJobBlockCode } from '@lobechat/types';
import { and, asc, eq, isNotNull, isNull, or } from 'drizzle-orm';

import type {
  ChannelItem,
  ChannelJobItem,
  ChannelMemberItem,
  ChannelRunItem,
  ChannelSessionItem,
} from '../../schemas';
import {
  channelJobs,
  channelMemberGrants,
  channelMembers,
  channelMessages,
  channelRuns,
  channelSessions,
  devices,
} from '../../schemas';
import type { Transaction } from '../../type';
import { findThread } from './delivery';
import { buildManifest } from './manifest';
import { audit } from './transaction';

export interface ChannelClaimOptions {
  /** Environment revision the device acknowledged; a claim for any other revision waits. */
  expectedEnvironmentRevision?: number;
  /** How long the claimer may go without a heartbeat before reconcile takes over. */
  leaseMs: number;
  /** Process or queue worker that will drive the run. */
  leaseOwner: string;
}

export interface ChannelClaim {
  member: ChannelMemberItem;
  run: ChannelRunItem;
  session: ChannelSessionItem;
}

const DIRECTORY_LOCK = 'channel_runs_active_directory_unique';

const uniqueViolation = (error: unknown): string | undefined => {
  const pgError = error as {
    cause?: { code?: string; constraint?: string };
    code?: string;
    constraint?: string;
  };
  const code = pgError.cause?.code ?? pgError.code;
  return code === '23505' ? (pgError.cause?.constraint ?? pgError.constraint ?? '') : undefined;
};

/** Records why a queued job cannot start; clients read the code, never the text. */
const block = async (
  tx: Transaction,
  job: ChannelJobItem,
  code: ChannelJobBlockCode,
  reason: string,
) => {
  if (job.blockedCode === code && job.blockedReason === reason) return;

  await tx
    .update(channelJobs)
    .set({ blockedCode: code, blockedReason: reason })
    .where(eq(channelJobs.id, job.id));
  await audit(tx, job.channelId, 'job_blocked', job.id, { code, reason });
};

/** Settles a job that must never run, e.g. its requester left or its environment changed. */
const cancel = async (tx: Transaction, job: ChannelJobItem, reason: string) => {
  await tx
    .update(channelJobs)
    .set({ blockedCode: null, blockedReason: null, status: 'cancelled' })
    .where(eq(channelJobs.id, job.id));
  await audit(tx, job.channelId, 'job_cancelled', job.id, { reason });
};

type Block = { code: ChannelJobBlockCode; reason: string };

const APPROVAL_PENDING: Block = {
  code: 'device_approval_pending',
  reason: 'Waiting for the device owner to approve',
};

/**
 * Whether the member may run on its device. Fails closed: outside a personal channel, a
 * device that is not public in this workspace needs an approved grant for exactly the
 * member's current device, directory and environment revision. A missing grant (never
 * requested, or deleted with the owner's account) blocks like a pending one.
 */
const deviceBlock = async (
  tx: Transaction,
  channel: ChannelItem,
  member: ChannelMemberItem,
): Promise<Block | undefined> => {
  const { deviceId, deviceOwnerId, workingDirectory } = member.config ?? {};
  if (workingDirectory && !deviceId)
    return { code: 'unavailable', reason: 'A working directory requires a device' };
  if (!deviceId) return;

  if (!channel.workspaceId)
    return deviceOwnerId && deviceOwnerId === channel.creatorId
      ? undefined
      : { code: 'unavailable', reason: 'The device does not belong to this channel owner' };

  const [shared] = await tx
    .select({ id: devices.id })
    .from(devices)
    .where(
      and(
        eq(devices.deviceId, deviceId),
        eq(devices.workspaceId, channel.workspaceId),
        eq(devices.visibility, 'public'),
      ),
    )
    .limit(1);
  if (shared) return;

  if (!deviceOwnerId || !workingDirectory) return APPROVAL_PENDING;
  const [grant] = await tx
    .select()
    .from(channelMemberGrants)
    .where(
      and(
        eq(channelMemberGrants.memberId, member.id),
        eq(channelMemberGrants.environmentRevision, member.environmentRevision),
      ),
    );
  if (
    !grant ||
    grant.deviceId !== deviceId ||
    grant.deviceOwnerId !== deviceOwnerId ||
    grant.workingDirectory !== workingDirectory
  )
    return APPROVAL_PENDING;
  if (grant.status === 'pending') return APPROVAL_PENDING;
  if (grant.status !== 'approved')
    return { code: 'unavailable', reason: 'The device owner did not allow this environment' };
};

/** Another channel's live writer in the same device directory. */
const directoryBlock = async (
  tx: Transaction,
  member: ChannelMemberItem,
): Promise<Block | undefined> => {
  const { deviceId, workingDirectory } = member.config ?? {};
  if (!deviceId || !workingDirectory) return;

  const [busy] = await tx
    .select({ id: channelRuns.id })
    .from(channelRuns)
    .where(
      and(
        eq(channelRuns.deviceId, deviceId),
        eq(channelRuns.workingDirectory, workingDirectory),
        eq(channelRuns.writerReleased, false),
      ),
    )
    .limit(1);
  if (busy) return { code: 'directory_locked', reason: 'Another run is using this directory' };
};

/**
 * Starts the job if it is at the head of its member's queue and nothing holds the member,
 * its environment or its directory. The caller holds the channel lock. Returns null when
 * the job cannot start now; a lasting reason is recorded on the job as `blockedCode`.
 */
export const claimJob = async (
  tx: Transaction,
  channel: ChannelItem,
  jobId: string,
  options: ChannelClaimOptions,
): Promise<ChannelClaim | null> => {
  if (channel.archived) return null;

  const [job] = await tx
    .select()
    .from(channelJobs)
    .where(
      and(
        eq(channelJobs.channelId, channel.id),
        eq(channelJobs.id, jobId),
        eq(channelJobs.status, 'queued'),
      ),
    );
  if (!job) return null;

  // Each member answers in message order.
  const [head] = await tx
    .select({ id: channelJobs.id })
    .from(channelJobs)
    .innerJoin(channelMessages, eq(channelMessages.id, channelJobs.messageId))
    .where(and(eq(channelJobs.memberId, job.memberId), eq(channelJobs.status, 'queued')))
    .orderBy(asc(channelMessages.sequence), asc(channelJobs.createdAt))
    .limit(1);
  if (head?.id !== job.id) return null;

  const [member] = await tx
    .select()
    .from(channelMembers)
    .where(and(eq(channelMembers.id, job.memberId), eq(channelMembers.active, true)));
  if (
    !member?.config ||
    member.executionPaused ||
    (options.expectedEnvironmentRevision !== undefined &&
      member.environmentRevision !== options.expectedEnvironmentRevision)
  )
    return null;

  const [busy] = await tx
    .select({ id: channelRuns.id })
    .from(channelRuns)
    .where(
      and(
        eq(channelRuns.memberId, member.id),
        or(
          and(eq(channelRuns.writerReleased, false), isNull(channelRuns.isolatedAt)),
          and(eq(channelRuns.cleanupRequested, true), eq(channelRuns.physicalStopped, false)),
        ),
      ),
    )
    .limit(1);
  if (busy) return null;

  const [request] = await tx
    .select()
    .from(channelMessages)
    .where(eq(channelMessages.id, job.messageId));
  // Queued before an environment switch: never run an old instruction in the new directory.
  if (request.sequence <= member.environmentCutoff) {
    await cancel(tx, job, 'environment_changed');
    return null;
  }
  // The requester is the execution identity; without them there is nobody to run as.
  const [requester] = await tx
    .select({ id: channelMembers.id })
    .from(channelMembers)
    .where(
      and(
        eq(channelMembers.id, job.requesterMemberId),
        eq(channelMembers.actorType, 'user'),
        eq(channelMembers.active, true),
        isNotNull(channelMembers.userId),
      ),
    );
  if (!requester) {
    await cancel(tx, job, 'requester_unavailable');
    return null;
  }

  const blocked = (await deviceBlock(tx, channel, member)) ?? (await directoryBlock(tx, member));
  if (blocked) {
    await block(tx, job, blocked.code, blocked.reason);
    return null;
  }

  const thread = await findThread(tx, channel.id, job.threadId);
  const scope = job.threadId ?? 'main';
  const [session] = await tx
    .insert(channelSessions)
    .values({ channelId: channel.id, memberId: member.id, scope })
    .onConflictDoUpdate({
      set: { scope },
      target: [channelSessions.memberId, channelSessions.scope],
    })
    .returning();
  const manifest = await buildManifest(tx, { job, member, request, session, thread });

  const now = new Date();
  let run: ChannelRunItem;
  try {
    // A savepoint, so losing the directory race to another channel keeps this transaction.
    run = await tx.transaction(async (savepoint) => {
      const [inserted] = await savepoint
        .insert(channelRuns)
        .values({
          channelId: channel.id,
          deviceId: member.config!.deviceId,
          environmentRevision: member.environmentRevision,
          executionConfig: member.config,
          heartbeatAt: now,
          jobId: job.id,
          leaseExpiresAt: new Date(now.getTime() + options.leaseMs),
          leaseOwner: options.leaseOwner,
          manifest,
          memberId: member.id,
          requesterMemberId: job.requesterMemberId,
          sessionId: session.id,
          workingDirectory: member.config!.workingDirectory,
        })
        .returning();
      return inserted;
    });
  } catch (error) {
    const constraint = uniqueViolation(error);
    if (constraint === undefined) throw error;
    if (constraint === DIRECTORY_LOCK)
      await block(tx, job, 'directory_locked', 'Another run is using this directory');
    return null;
  }

  await tx
    .update(channelJobs)
    .set({ blockedCode: null, blockedReason: null, status: 'running' })
    .where(eq(channelJobs.id, job.id));
  await audit(tx, channel.id, 'run_claimed', run.id, {
    cutoff: manifest.cutoffSequence,
    jobId: job.id,
    source: manifest.source,
  });

  return { member, run, session };
};
