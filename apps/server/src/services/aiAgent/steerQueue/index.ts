import debug from 'debug';

import { redisService } from '@/server/services/redis';
import type { SteerQueueEntry, SteerQueueScope } from '@/server/services/redis/steerQueue';

import { type ComposerRunContext, type ComposerRunRequest, startComposerRun } from '../composerRun';

const log = debug('lobe-server:steer-queue');

/**
 * The part of a composer send a queued follow-up keeps: a fresh message typed
 * into a running conversation. Resume, regenerate and supersede fields have no
 * meaning for a turn that starts later, so they are never stored.
 */
export type QueuedFollowUpRequest = Omit<
  ComposerRunRequest,
  | 'autoStart'
  | 'clientOperations'
  | 'existingMessageIds'
  | 'includeFinalState'
  | 'parentMessageId'
  | 'replacesOperationId'
  | 'resumeApproval'
  | 'resumeApprovals'
  | 'resumeToolResult'
  | 'sourceOperationId'
  | 'steer'
>;

export interface QueuedFollowUp extends SteerQueueEntry {
  /** Server-derived provenance of the request that queued it. */
  audit?: { clientIp?: string; userAgent?: string };
  request: QueuedFollowUpRequest;
  /** Who queued it; only the run owner's own follow-ups are started for them. */
  userId: string;
}

const uniq = <T>(items: T[]) => [...new Set(items)];

/**
 * Fold every waiting follow-up into one request, the way the client merges its
 * own queue: the texts in queue order, every attachment and selection kept.
 * The newest entry decides the run settings (model, device, approvals), since
 * that is what the user last had selected when they queued.
 */
export const mergeQueuedFollowUps = (entries: QueuedFollowUp[]): QueuedFollowUpRequest => {
  const sorted = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  const latest = sorted.at(-1)!.request;

  const fileIds = uniq(sorted.flatMap((entry) => entry.request.fileIds ?? []));
  const selectedSkillIds = uniq(sorted.flatMap((entry) => entry.request.selectedSkillIds ?? []));
  const selectedToolIds = uniq(sorted.flatMap((entry) => entry.request.selectedToolIds ?? []));
  const mentionedAgents = [
    ...new Map(
      sorted.flatMap((entry) => entry.request.mentionedAgents ?? []).map((a) => [a.id, a]),
    ).values(),
  ];

  return {
    ...latest,
    // Client-minted row ids belong to one optimistic send; a merged send
    // creates rows none of the queued sends announced.
    clientIds: sorted.length === 1 ? latest.clientIds : undefined,
    fileIds: fileIds.length ? fileIds : undefined,
    mentionedAgents: mentionedAgents.length ? mentionedAgents : undefined,
    prompt: sorted.map((entry) => entry.request.prompt).join('\n\n'),
    selectedSkillIds: selectedSkillIds.length ? selectedSkillIds : undefined,
    selectedToolIds: selectedToolIds.length ? selectedToolIds : undefined,
  };
};

/**
 * A top-level run just finished on `scope`: start the follow-ups queued behind
 * it as the next turn, here on the server, instead of waiting for a client to
 * drain them. Called by both runtimes — the native step loop and a
 * heterogeneous agent's (Claude Code, Codex) finish callback.
 *
 * Drain is atomic, so exactly one finishing run takes a given follow-up. When
 * the next turn cannot start, the follow-ups go back to the head of the queue —
 * the next run that ends picks them up, and the client can still list them.
 *
 * @returns the started operation, or `undefined` when nothing was queued or the
 * start failed
 */
export const startQueuedFollowUp = async (
  ctx: ComposerRunContext,
  params: { operationId: string; scope: SteerQueueScope },
): Promise<{ operationId: string } | undefined> => {
  const { scope } = params;

  const drained = await redisService.steerQueue.drain<QueuedFollowUp>(scope);
  if (drained.length === 0) return;

  // `append` admits only the run owner, so a foreign entry cannot come from it;
  // never start one under this user's authority if it somehow got here.
  const entries = drained.filter((entry) => entry.userId === ctx.userId);
  if (entries.length < drained.length) {
    log(
      '[%s] Dropped %d foreign queued follow-ups',
      params.operationId,
      drained.length - entries.length,
    );
  }
  if (entries.length === 0) return;

  const request = mergeQueuedFollowUps(entries);
  const audit = entries.at(-1)!.audit;

  try {
    const result = await startComposerRun(
      { ...ctx, clientIp: audit?.clientIp, userAgent: audit?.userAgent },
      {
        ...request,
        appContext: { ...request.appContext, threadId: scope.threadId, topicId: scope.topicId },
        steer: true,
      },
    );
    log(
      '[%s] Started queued follow-up as %s (%d merged)',
      params.operationId,
      result.operationId,
      entries.length,
    );
    return { operationId: result.operationId };
  } catch (error) {
    console.error(
      '[startQueuedFollowUp] failed to start the queued follow-up after %s: %O',
      params.operationId,
      error,
    );
    await redisService.steerQueue.restore(scope, entries).catch((restoreError) => {
      console.error(
        '[startQueuedFollowUp] failed to restore %d queued follow-ups for topic %s: %O',
        entries.length,
        scope.topicId,
        restoreError,
      );
    });
    return;
  }
};
