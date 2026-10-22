import { and, eq, gt } from 'drizzle-orm';

import type { ChannelRunItem } from '../../schemas';
import { channelJobs, channelMembers, channelRuns, channelSessions } from '../../schemas';
import type { LobeChatDatabase, Transaction } from '../../type';
import type { ChannelClaim, ChannelClaimOptions } from './claim';
import { claimJob } from './claim';
import { appendMessage } from './delivery';
import { ChannelError } from './error';
import type { ChannelRoutingDecision } from './routing';
import { resolveRouting } from './routing';
import type { ChannelStopScope } from './stop';
import { stopScope } from './stop';
import { audit, withChannelLock } from './transaction';
import { isolateWriter } from './writer';

/**
 * Run fence check under the channel lock. `fence` is publication authority; a revoked run
 * may still record its termination (`allowRevoked`) but never publish.
 */
const fenced = async (
  tx: Transaction,
  channelId: string,
  runId: string,
  fence: number,
  allowRevoked = false,
): Promise<ChannelRunItem> => {
  const [run] = await tx
    .select()
    .from(channelRuns)
    .where(
      and(
        eq(channelRuns.channelId, channelId),
        eq(channelRuns.id, runId),
        eq(channelRuns.fence, fence),
      ),
    );
  if (!run || (!allowRevoked && run.publicationRevoked))
    throw new ChannelError('CONFLICT', 'Run authority was revoked');

  return run;
};

/**
 * Channel writes made by the system rather than by a person: the dispatcher, native
 * completion callbacks, device receipts and reconcile. Every method locks the channel row,
 * then bumps the revision in the same transaction. Callers must authenticate the source
 * (run-scoped token, service credentials) before calling.
 */
export class ChannelExecutionModel {
  constructor(private readonly db: LobeChatDatabase) {}

  /** Writes back a Jev decision for `attempt`; false when the result is stale. */
  resolveRouting = async (
    channelId: string,
    messageId: string,
    attempt: number,
    decision: ChannelRoutingDecision,
  ) =>
    withChannelLock(this.db, channelId, (tx) =>
      resolveRouting(tx, channelId, messageId, attempt, decision),
    );

  /** Starts a queued job; null when it cannot start now. See {@link claimJob}. */
  claim = async (
    channelId: string,
    jobId: string,
    options: ChannelClaimOptions,
  ): Promise<ChannelClaim | null> =>
    withChannelLock(this.db, channelId, (tx, channel) => claimJob(tx, channel, jobId, options));

  /** The runtime took the input: the session's cursor moves to the manifest cutoff. */
  accepted = async (
    channelId: string,
    runId: string,
    fence: number,
    receipt: { nativeSessionId: string; nativeTurnId?: string },
  ) =>
    withChannelLock(this.db, channelId, async (tx) => {
      const run = await fenced(tx, channelId, runId, fence);
      if (run.acceptance === 'accepted') return;

      await tx
        .update(channelRuns)
        .set({
          acceptance: 'accepted',
          activity: 'running',
          nativeTurnId: receipt.nativeTurnId,
          status: 'running',
        })
        .where(eq(channelRuns.id, run.id));
      const [session] = await tx
        .select()
        .from(channelSessions)
        .where(eq(channelSessions.id, run.sessionId));
      await tx
        .update(channelSessions)
        .set({
          acceptedSequence: Math.max(session.acceptedSequence, run.manifest.cutoffSequence),
          nativeSessionId: receipt.nativeSessionId,
        })
        .where(eq(channelSessions.id, session.id));
      await audit(tx, channelId, 'input_accepted', run.id, {
        cutoff: run.manifest.cutoffSequence,
      });
    });

  /** Stores the final answer. Immutable once saved, so a retry cannot change it. */
  saveDraft = async (channelId: string, runId: string, fence: number, content: string) =>
    withChannelLock(this.db, channelId, async (tx) => {
      const run = await fenced(tx, channelId, runId, fence);
      if (run.draft !== null) {
        if (run.draft !== content)
          throw new ChannelError('CONFLICT', 'The final draft is immutable');
        return;
      }
      await tx.update(channelRuns).set({ draft: content }).where(eq(channelRuns.id, run.id));
    });

  /**
   * Publishes the saved draft as the member's reply and completes the job. Idempotent: a
   * second call returns the same message id.
   */
  publish = async (channelId: string, runId: string, fence: number): Promise<string> =>
    withChannelLock(this.db, channelId, async (tx) => {
      const run = await fenced(tx, channelId, runId, fence);
      if (run.publishedMessageId) return run.publishedMessageId;
      if (run.draft === null || run.acceptance !== 'accepted')
        throw new ChannelError('CONFLICT', 'No accepted final draft');

      const [member] = await tx
        .select({ id: channelMembers.id })
        .from(channelMembers)
        .where(and(eq(channelMembers.id, run.memberId), eq(channelMembers.active, true)));
      if (!member) throw new ChannelError('CONFLICT', 'The member left the channel');

      const reply = await appendMessage(tx, {
        authorMemberId: run.memberId,
        channelId,
        content: run.draft,
        replyToId: run.manifest.requestMessageId,
        requestKey: `run:${run.id}`,
        routingStatus: 'reply',
        threadId: run.manifest.threadId,
      });
      await tx
        .update(channelRuns)
        .set({ publicationStatus: 'published', publishedMessageId: reply.id })
        .where(eq(channelRuns.id, run.id));
      await tx
        .update(channelJobs)
        .set({ status: 'completed' })
        .where(eq(channelJobs.id, run.jobId));
      await audit(tx, channelId, 'draft_published', run.id, { messageId: reply.id });

      return reply.id;
    });

  /**
   * Physical termination confirmed (process tree ended, or the native operation finished).
   * The only way to release a writer, and with it the member and the device directory.
   */
  releaseWriter = async (channelId: string, runId: string, fence: number) =>
    withChannelLock(this.db, channelId, async (tx) => {
      const run = await fenced(tx, channelId, runId, fence, true);
      if (run.writerReleased) return;

      const failed = run.status === 'failed' || run.status === 'execution_unknown';
      await tx
        .update(channelRuns)
        .set({
          activity: null,
          error: failed ? run.error : null,
          leaseExpiresAt: null,
          leaseOwner: null,
          status: failed ? run.status : run.publicationRevoked ? 'stopped' : 'completed',
          writerReleased: true,
          ...(run.executionConfig?.runtime === 'native' && {
            cleanupRequested: false,
            physicalStopped: true,
          }),
        })
        .where(eq(channelRuns.id, run.id));
      await audit(tx, channelId, 'writer_released', run.id);
    });

  /**
   * The run failed. Revokes its publication and fails its job unless it was already being
   * stopped. `notSubmitted` marks a trusted pre-dispatch failure: nothing ran, so the writer
   * is released in the same transaction.
   */
  fail = async (
    channelId: string,
    runId: string,
    fence: number,
    failure: { message: string; notSubmitted?: boolean },
  ) =>
    withChannelLock(this.db, channelId, async (tx) => {
      const run = await fenced(tx, channelId, runId, fence, true);
      const [job] = await tx
        .select({ status: channelJobs.status })
        .from(channelJobs)
        .where(eq(channelJobs.id, run.jobId));
      const stopping =
        job?.status === 'cancelled' || run.status === 'stop_requested' || run.status === 'stopped';
      const released = run.writerReleased || Boolean(failure.notSubmitted);

      await tx
        .update(channelRuns)
        .set({
          error: stopping ? null : failure.message,
          publicationRevoked: true,
          status: stopping ? (released ? 'stopped' : 'stop_requested') : 'failed',
          ...(failure.notSubmitted && {
            cleanupRequested: false,
            leaseExpiresAt: null,
            leaseOwner: null,
            physicalStopped: true,
            writerReleased: true,
          }),
        })
        .where(eq(channelRuns.id, run.id));
      if (!stopping)
        await tx.update(channelJobs).set({ status: 'failed' }).where(eq(channelJobs.id, run.jobId));
      await audit(tx, channelId, 'execution_failed', run.id, {
        message: failure.message,
        notSubmitted: Boolean(failure.notSubmitted),
      });
    });

  /**
   * Lost the acknowledgement: the runtime may or may not have the input. Never redelivered
   * automatically; the writer stays held until termination is confirmed or it is isolated.
   */
  executionUnknown = async (channelId: string, runId: string, fence: number, message: string) =>
    withChannelLock(this.db, channelId, async (tx) => {
      const run = await fenced(tx, channelId, runId, fence, true);
      if (run.writerReleased || run.status === 'execution_unknown') return;

      await tx
        .update(channelRuns)
        .set({ error: message, status: 'execution_unknown' })
        .where(eq(channelRuns.id, run.id));
      await audit(tx, channelId, 'execution_unknown', run.id, { message });
    });

  /** Isolates a writer whose termination stayed unconfirmed. See {@link isolateWriter}. */
  isolate = async (channelId: string, runId: string, fence: number, reason: string) =>
    withChannelLock(this.db, channelId, async (tx) =>
      isolateWriter(tx, await fenced(tx, channelId, runId, fence, true), reason),
    );

  /** System-initiated stop, e.g. a budget or reconcile decision. See {@link stopScope}. */
  stop = async (channelId: string, scope: ChannelStopScope) =>
    withChannelLock(this.db, channelId, (tx) => stopScope(tx, channelId, scope));

  /**
   * Extends the lease of a live run. Touches only the run row and takes no channel lock, so
   * it cannot deadlock with channel writes, and does not bump the revision: nobody watches
   * heartbeats. Returns false once the run lost its lease, fence or writer.
   */
  heartbeat = async (
    runId: string,
    fence: number,
    lease: { leaseMs: number; leaseOwner: string },
  ): Promise<boolean> => {
    const now = new Date();
    const renewed = await this.db
      .update(channelRuns)
      .set({ heartbeatAt: now, leaseExpiresAt: new Date(now.getTime() + lease.leaseMs) })
      .where(
        and(
          eq(channelRuns.id, runId),
          eq(channelRuns.fence, fence),
          eq(channelRuns.leaseOwner, lease.leaseOwner),
          eq(channelRuns.writerReleased, false),
          gt(channelRuns.leaseExpiresAt, now),
        ),
      )
      .returning({ id: channelRuns.id });

    return renewed.length > 0;
  };
}
