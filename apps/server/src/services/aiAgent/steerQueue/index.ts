import { TRPCError } from '@trpc/server';
import debug from 'debug';

import { assertCanUseWorkspaceAgent } from '@/server/routers/lambda/_helpers/workspaceAgentGuard';
import { assertCanUseAgentRunConversation } from '@/server/routers/lambda/aiAgent/guards';
import { redisService } from '@/server/services/redis';
import type { SteerQueueEntry, SteerQueueScope } from '@/server/services/redis/steerQueue';

import { type ComposerRunContext, type ComposerRunRequest, startComposerRun } from '../composerRun';
import { findOwnLiveRuns, isRunAlive } from './liveRuns';

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

/** Guard outcomes that mean the user may no longer start this turn. */
const DENIED_CODES = new Set<TRPCError['code']>(['FORBIDDEN', 'NOT_FOUND']);

/** Follow-ups that did not go anywhere: put them back at the head of the queue. */
export const restoreAfterFailure = async (
  scope: SteerQueueScope,
  entries: QueuedFollowUp[],
  operationId: string,
  error: unknown,
) => {
  console.error(
    '[steerQueue] queued follow-ups after %s did not go through: %O',
    operationId,
    error,
  );
  try {
    const dropped = await redisService.steerQueue.restore(scope, entries);
    if (dropped > 0) {
      console.error(
        '[steerQueue] queue for topic %s was full again: dropped the %d newest follow-ups',
        scope.topicId,
        dropped,
      );
    }
  } catch (restoreError) {
    console.error(
      '[steerQueue] failed to restore %d queued follow-ups for topic %s: %O',
      entries.length,
      scope.topicId,
      restoreError,
    );
  }
};

/**
 * Take the follow-ups `operationId` owns — queued behind it, put back unbound
 * after a failed start, or orphaned by a run that ended while Redis was out of
 * reach. Another live run on the surface keeps its own.
 * The queue is the run owner's (the scope carries their user id); a foreign
 * entry is never acted on under this user's authority if one somehow got here.
 *
 * @throws when Redis is unavailable: the entries stay queued
 */
export const drainOwnFollowUps = async (
  ctx: Pick<ComposerRunContext, 'db' | 'userId' | 'workspaceId'>,
  scope: SteerQueueScope,
  operationId: string,
): Promise<QueuedFollowUp[]> => {
  const { operationIds, total } = await redisService.steerQueue.boundOperations(scope);
  if (total === 0) return [];

  // Entries behind another run are left to it unless that run is confirmed
  // ended — checked one by one, so a run that starts meanwhile (and the
  // follow-ups queued behind it) is never mistaken for an orphan.
  const ended: string[] = [];
  for (const id of operationIds) {
    if (id !== operationId && !(await isRunAlive(ctx, ctx.userId, id))) ended.push(id);
  }
  const drained = await redisService.steerQueue.drain<QueuedFollowUp>(scope, operationId, ended);
  const entries = drained.filter((entry) => entry.userId === ctx.userId);
  if (entries.length < drained.length) {
    log('[%s] Dropped %d foreign queued follow-ups', operationId, drained.length - entries.length);
  }
  return entries;
};

/**
 * `append` authorized a follow-up when it was queued; access can be revoked
 * while the run is still going. Re-check it the way `aiAgent.execAgent` checks
 * every run. `denied` means the follow-ups are no longer this user's to send —
 * putting them back would only retry a refused send; any other failure of the
 * check says nothing about access and is thrown.
 */
export const checkFollowUpAccess = async (
  ctx: Pick<ComposerRunContext, 'db' | 'userId' | 'workspaceId'>,
  request: QueuedFollowUpRequest,
  scope: SteerQueueScope,
): Promise<'allowed' | 'denied'> => {
  try {
    await assertCanUseWorkspaceAgent({
      agentId: request.agentId,
      db: ctx.db,
      groupId: request.appContext?.groupId,
      slug: request.slug,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    });
    await assertCanUseAgentRunConversation({
      db: ctx.db,
      topicId: scope.topicId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    });
    return 'allowed';
  } catch (error) {
    if (error instanceof TRPCError && DENIED_CODES.has(error.code)) return 'denied';
    throw error;
  }
};

/**
 * A top-level run just finished on `scope`: start the follow-ups still queued
 * behind it as the next turn, here on the server, instead of waiting for a
 * client to drain them. A native run takes most follow-ups into itself before
 * its next LLM call (`injectQueuedFollowUp`); this picks up the rest — those
 * that arrived after its last decision point or could not join a running turn —
 * and serves heterogeneous agents (Claude Code, Codex) when they finish.
 *
 * Drain is atomic, so exactly one finishing run takes a given follow-up. When
 * the next turn cannot start, the follow-ups go back to the head of the queue —
 * the next run that ends picks them up, and the client can still list them.
 * When the user lost access to the agent or conversation meanwhile, they are
 * dropped instead.
 *
 * @returns the started operation, or `undefined` when nothing was queued or the
 * start failed
 */
export const startQueuedFollowUp = async (
  ctx: ComposerRunContext,
  params: { operationId: string; scope: SteerQueueScope },
): Promise<{ operationId: string } | undefined> => {
  const { scope } = params;

  const entries = await drainOwnFollowUps(ctx, scope, params.operationId);
  if (entries.length === 0) return;

  const request = mergeQueuedFollowUps(entries);
  const audit = entries.at(-1)!.audit;

  try {
    if ((await checkFollowUpAccess(ctx, request, scope)) === 'denied') {
      console.error(
        '[startQueuedFollowUp] dropped %d queued follow-ups after %s: access revoked',
        entries.length,
        params.operationId,
      );
      return;
    }
  } catch (error) {
    await restoreAfterFailure(scope, entries, params.operationId, error);
    return;
  }

  // The topic was free for a moment between the finished run and this start;
  // a send the user made in that gap now owns the surface. Never interrupt it:
  // the follow-ups go back, unbound, and that run takes them.
  try {
    const others = (await findOwnLiveRuns(ctx, scope)).filter((id) => id !== params.operationId);
    if (others.length > 0) {
      await redisService.steerQueue.restore(scope, entries);
      log(
        '[%s] Left %d queued follow-ups to live run %s',
        params.operationId,
        entries.length,
        others[0],
      );
      return;
    }
  } catch (error) {
    await restoreAfterFailure(scope, entries, params.operationId, error);
    return;
  }

  try {
    const result = await startComposerRun(
      // Not superseding: should a send still win the topic before this start
      // claims it, the start fails and the follow-ups go back to the queue.
      { ...ctx, clientIp: audit?.clientIp, supersedeLiveRun: false, userAgent: audit?.userAgent },
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
    await restoreAfterFailure(scope, entries, params.operationId, error);
    return;
  }
};
