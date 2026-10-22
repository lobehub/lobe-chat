import { eq } from 'drizzle-orm';

import type { ChannelRunItem, ChannelSessionItem } from '../../schemas';
import { channelJobs, channelRuns, channelSessions } from '../../schemas';
import type { Transaction } from '../../type';
import { audit } from './transaction';

/** Job statuses a stop, failure or isolation still settles. */
export const OPEN_JOB_STATUSES = ['queued', 'running'] as const;

/** Retires a session; the next delivery in its scope starts a new one from a full snapshot. */
export const rotateSession = async (tx: Transaction, session: ChannelSessionItem) => {
  await tx
    .update(channelSessions)
    .set({ scope: `archived:${session.id}` })
    .where(eq(channelSessions.id, session.id));
  await tx.insert(channelSessions).values({
    channelId: session.channelId,
    generation: session.generation + 1,
    memberId: session.memberId,
    scope: session.scope,
  });
};

/**
 * Logically isolates a writer whose termination stayed unconfirmed (INC-049). Its
 * publication is revoked, an open job is settled as failed and its session retired, so the
 * member can run again from a fresh snapshot. It never claims the process stopped:
 * `writerReleased` and `physicalStopped` change only on physical confirmation, and the
 * device directory stays locked until then.
 */
export const isolateWriter = async (tx: Transaction, run: ChannelRunItem, reason: string) => {
  if (run.writerReleased || run.isolatedAt) return false;

  const [job] = await tx.select().from(channelJobs).where(eq(channelJobs.id, run.jobId));
  if (job && (OPEN_JOB_STATUSES as readonly string[]).includes(job.status))
    await tx.update(channelJobs).set({ status: 'failed' }).where(eq(channelJobs.id, job.id));
  await tx
    .update(channelRuns)
    .set({ isolatedAt: new Date(), publicationRevoked: true })
    .where(eq(channelRuns.id, run.id));

  const [session] = await tx
    .select()
    .from(channelSessions)
    .where(eq(channelSessions.id, run.sessionId));
  if (session && !session.scope.startsWith('archived:')) await rotateSession(tx, session);

  await audit(tx, run.channelId, 'execution_isolated', run.id, {
    physicalStopped: run.physicalStopped,
    reason,
    status: run.status,
  });

  return true;
};
