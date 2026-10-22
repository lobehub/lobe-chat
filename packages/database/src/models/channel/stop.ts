import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

import type { ChannelRunItem } from '../../schemas';
import { channelJobs, channelMessages, channelRuns } from '../../schemas';
import type { Transaction } from '../../type';
import { findThread } from './delivery';
import { audit } from './transaction';
import { OPEN_JOB_STATUSES } from './writer';

/** One run, or everything in a branch (`threadId: null` is the main channel). */
export type ChannelStopScope = { runId: string } | { threadId: string | null };

/**
 * Cancels queued and running work in the scope and revokes the publication of every run that
 * has not both published and released its writer. Pending routing in a branch is closed and
 * its attempt bumped, so a late Jev answer is ignored.
 *
 * Returns the runs whose writer is still held: the caller must stop them physically, and only
 * that confirmation releases them.
 */
export const stopScope = async (
  tx: Transaction,
  channelId: string,
  scope: ChannelStopScope,
): Promise<ChannelRunItem[]> => {
  let runs: ChannelRunItem[];
  let jobIds: string[];

  if ('runId' in scope) {
    runs = await tx
      .select()
      .from(channelRuns)
      .where(and(eq(channelRuns.channelId, channelId), eq(channelRuns.id, scope.runId)));
    jobIds = runs.map((run) => run.jobId);
  } else {
    await findThread(tx, channelId, scope.threadId);
    const inBranch = scope.threadId
      ? eq(channelMessages.threadId, scope.threadId)
      : isNull(channelMessages.threadId);
    await tx
      .update(channelMessages)
      .set({
        routingAttempt: sql`${channelMessages.routingAttempt} + 1`,
        routingReason: 'Stopped before routing finished',
        routingStatus: 'unassigned',
      })
      .where(
        and(
          eq(channelMessages.channelId, channelId),
          eq(channelMessages.routingStatus, 'pending'),
          inBranch,
        ),
      );

    const jobs = await tx
      .select({ id: channelJobs.id })
      .from(channelJobs)
      .where(
        and(
          eq(channelJobs.channelId, channelId),
          scope.threadId ? eq(channelJobs.threadId, scope.threadId) : isNull(channelJobs.threadId),
        ),
      );
    jobIds = jobs.map((job) => job.id);
    runs = jobIds.length
      ? await tx.select().from(channelRuns).where(inArray(channelRuns.jobId, jobIds))
      : [];
  }

  const cancelledJobs = jobIds.length
    ? await tx
        .update(channelJobs)
        .set({ status: 'cancelled' })
        .where(and(inArray(channelJobs.id, jobIds), inArray(channelJobs.status, OPEN_JOB_STATUSES)))
        .returning({ id: channelJobs.id })
    : [];

  const revocable = runs.filter(
    (run) => !run.publicationRevoked && (!run.publishedMessageId || !run.writerReleased),
  );
  for (const run of revocable) {
    await tx
      .update(channelRuns)
      .set({ publicationRevoked: true, status: run.writerReleased ? 'stopped' : 'stop_requested' })
      .where(eq(channelRuns.id, run.id));
  }

  if (cancelledJobs.length || revocable.length)
    await audit(tx, channelId, 'stop_requested', 'runId' in scope ? scope.runId : channelId, {
      jobs: cancelledJobs.map((job) => job.id),
      runs: revocable.map((run) => run.id),
      threadId: 'threadId' in scope ? scope.threadId : null,
    });

  return runs
    .filter((run) => !run.writerReleased)
    .map((run) =>
      revocable.includes(run)
        ? {
            ...run,
            publicationRevoked: true,
            status: 'stop_requested' as const,
          }
        : run,
    );
};
