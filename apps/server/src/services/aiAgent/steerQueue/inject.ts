import type { AgentState } from '@lobechat/agent-runtime';
import { RequestTrigger } from '@lobechat/types';
import debug from 'debug';

import { MessageModel } from '@/database/models/message';
import { redisService } from '@/server/services/redis';
import type { SteerQueueScope } from '@/server/services/redis/steerQueue';

import type { ComposerRunContext } from '../composerRun';
import { createUserTurnAnchor } from '../pipeline/resolveUserMessageParentId';
import { buildUserTurnMetadata } from '../pipeline/userTurnMetadata';
import {
  checkFollowUpAccess,
  drainOwnFollowUps,
  mergeQueuedFollowUps,
  type QueuedFollowUp,
  restoreAfterFailure,
} from './index';

const log = debug('lobe-server:steer-queue');

/**
 * Whether a follow-up can join the run that is already going: plain text for
 * the same agent. Anything that needs a turn configured for it — attachments,
 * tool or skill selections, @-mentions, another agent — waits for the
 * hand-back and starts as the next turn instead.
 */
export const canJoinRunningTurn = (entry: QueuedFollowUp, state: AgentState): boolean => {
  const { request } = entry;
  if (!request.prompt.trim()) return false;
  if (request.fileIds?.length) return false;
  if (request.selectedToolIds?.length || request.selectedSkillIds?.length) return false;
  if (request.mentionedAgents?.length) return false;

  const runAgentId = state.origin?.agentId;
  return !!request.agentId && !!runAgentId && request.agentId === runAgentId;
};

/**
 * The run is at a decision point right before its next LLM call: take the
 * follow-ups queued behind it into the run as one steer user message, anchored
 * where a composer send would anchor it, so the model reads them on this very
 * step. The leading follow-ups that can join are taken (queue order is kept);
 * the rest go back to the head of the queue for the hand-back.
 *
 * @returns the persisted user message, or `undefined` when nothing joined
 */
export const injectQueuedFollowUp = async (
  ctx: Pick<ComposerRunContext, 'db' | 'userId' | 'workspaceId'>,
  params: { operationId: string; scope: SteerQueueScope; state: AgentState },
): Promise<{ messageId: string } | undefined> => {
  const { operationId, scope, state } = params;

  const entries = await drainOwnFollowUps(ctx.userId, scope, operationId);
  if (entries.length === 0) return;

  const firstHeld = entries.findIndex((entry) => !canJoinRunningTurn(entry, state));
  const joining = firstHeld === -1 ? entries : entries.slice(0, firstHeld);
  const held = entries.slice(joining.length);
  if (held.length > 0) {
    // Back at the head, for the hand-back at the next decision point.
    await redisService.steerQueue.restore(scope, held);
  }
  if (joining.length === 0) return;

  const request = mergeQueuedFollowUps(joining);

  try {
    if ((await checkFollowUpAccess(ctx, request, scope)) === 'denied') {
      console.error(
        '[injectQueuedFollowUp] dropped %d queued follow-ups for %s: access revoked',
        joining.length,
        operationId,
      );
      return;
    }

    const messageModel = new MessageModel(ctx.db, ctx.userId, ctx.workspaceId ?? undefined);
    const groupId = request.appContext?.groupId ?? undefined;
    const parentId = await createUserTurnAnchor(messageModel, {
      allowShareVisitor: false,
      groupId,
      threadId: scope.threadId ?? null,
      topicId: scope.topicId,
    }).resolveParentId();

    const message = await messageModel.create({
      agentId: state.origin?.agentId,
      content: request.prompt,
      groupId,
      metadata: buildUserTurnMetadata({
        steer: true,
        trigger: request.trigger ?? RequestTrigger.Chat,
      }),
      parentId,
      role: 'user',
      threadId: scope.threadId ?? undefined,
      topicId: scope.topicId,
    });

    log('[%s] Joined %d queued follow-ups as %s', operationId, joining.length, message.id);
    return { messageId: message.id };
  } catch (error) {
    await restoreAfterFailure(scope, joining, operationId, error);
    return;
  }
};
