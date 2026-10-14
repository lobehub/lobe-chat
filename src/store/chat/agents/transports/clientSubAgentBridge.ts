import { type ConversationContext } from '@lobechat/types';
import debug from 'debug';

import { messageMapKey } from '@/store/chat/utils/messageMapKey';

const log = debug('lobe-store:client-subagent-bridge');

/**
 * Client-side completion bridge for parked sub-agent / group-member parents —
 * the mirror of the server's `completeSubAgentBridge` (AgentRuntimeService).
 *
 * Why this exists: when a client-executed child (a `callSubAgent` run or a
 * group-orchestration member) parks on human approval / an async tool, the
 * parent's tool call must NOT settle. The parent parks in
 * `waiting_for_async_tool` holding a deferred placeholder tool message, and
 * this bridge is what settles it later:
 *
 *   1. The child's run reaches a terminal state → `fireClientSubAgentBridge`
 *      is invoked at the run boundary (streamingExecutor).
 *   2. The bridge backfills the parent's placeholder tool message with the
 *      child's final output (so the parent conversation rebuilds with a real
 *      tool result).
 *   3. The bridge resumes the parked parent:
 *      - `sub-agent` kind: re-enters `executeClientAgent` from the tool
 *        message position (phase `tool_result`), the same re-entry shape the
 *        human-approval resume path uses.
 *      - `group-orchestration` kind: re-enters
 *        `internal_execGroupOrchestration` with the member's `task_completed`
 *        result as the initial result, so the supervisor sees the member's
 *        final answer and decides the next round.
 *
 * Registry keys are the CHILD's isolation threadId: the parked child resumes
 * out-of-band under a DIFFERENT operation (user approval / queued follow-up),
 * so an operation-id key would never fire — but every continuation of the
 * child runs in the same thread, whose terminal run boundary claims the
 * bridge. Claiming removes the entry (CAS single-fire): a later terminal run
 * in the same thread is a no-op, so an already-resumed parent's tool message
 * is never rewritten.
 */

interface SubAgentBridgeRegistration {
  /** The child's isolation context — supplies the registry key (threadId). */
  childContext: ConversationContext;
  /** The parked child run's operation (cleaned up once the bridge fires). */
  childOperationId: string;
  kind: 'sub-agent';
  /** Conversation context of the parked parent run (resume target). */
  parentContext: ConversationContext;
  /** The parked parent run's operation id (completed, then resumed). */
  parentOperationId: string;
  /** Message id of the parent's deferred placeholder tool message. */
  toolMessageId: string;
}
interface GroupOrchestrationBridgeRegistration {
  childContext: ConversationContext;
  childOperationId: string;
  kind: 'group-orchestration';
  /** AgentId of the member whose parked run this bridge settles. */
  memberAgentId: string;
  /** Conversation context of the orchestration (messageContext). */
  messageContext: ConversationContext;
  /** The parked orchestration operation id (completed before re-entry). */
  orchestrationOperationId: string;
  supervisorAgentId: string;
  /** Message id of the supervisor's group task tool message. */
  toolMessageId: string;
}

export type ClientSubAgentBridgeRegistration =
  GroupOrchestrationBridgeRegistration | SubAgentBridgeRegistration;

const registry = new Map<string, ClientSubAgentBridgeRegistration>();

const registryKey = (childContext: ConversationContext): string | undefined =>
  childContext.threadId ?? undefined;

export const registerClientSubAgentBridge = (registration: ClientSubAgentBridgeRegistration) => {
  const key = registryKey(registration.childContext);
  if (!key) {
    log('bridge registration skipped: child context has no threadId');
    return;
  }
  registry.set(key, registration);
  log(
    'bridge registered: key=%s kind=%s toolMessage=%s',
    key,
    registration.kind,
    registration.toolMessageId,
  );
};

/**
 * Fire the completion bridge for a child run that just reached a terminal
 * state. Fire-and-forget: errors are logged, never thrown — a bridge failure
 * must not fail the child's own completion. Without the server bridge's
 * queue redelivery a failed claim is dropped, but a bridge only exists after
 * a park, and the failure is logged loudly for diagnosis.
 */
export const fireClientSubAgentBridge = async (
  get: () => any,
  context: ConversationContext,
): Promise<void> => {
  const key = context.threadId;
  if (!key) return;

  const registration = registry.get(key);
  if (!registration) return;
  registry.delete(key);

  try {
    const childOp = get().operations[registration.childOperationId];
    const childThreadId = registration.childContext.threadId;

    // The child's final output: read from its isolation thread messages.
    const threadMessages = childThreadId
      ? get().dbMessagesMap[messageMapKey(registration.childContext)] || []
      : [];
    const lastAssistant = threadMessages.findLast?.((m: any) => m.role === 'assistant');
    const resultContent =
      lastAssistant?.content ||
      'Sub-agent finished without a text answer. Check its thread for details.';

    log(
      'bridge firing: key=%s kind=%s result=%d chars',
      key,
      registration.kind,
      resultContent.length,
    );

    // The parked child op itself never completed (parking skips terminal
    // side effects and the resume runs under a new operation) — retire it so
    // it does not linger as a zombie running op.
    if (childOp?.status === 'running') {
      get().completeOperation(registration.childOperationId);
    }

    if (registration.kind === 'sub-agent') {
      await fireSubAgentBridge(get, registration, resultContent);
    } else {
      await fireGroupOrchestrationBridge(get, registration, resultContent);
    }
  } catch (error) {
    log('bridge failed for key %s: %O', key, error);
  }
};

/**
 * Sub-agent kind: backfill the parent's placeholder tool message, then resume
 * the parked parent run from the tool message position (phase `tool_result` —
 * the same re-entry shape the human-approval resume uses, minus the approval
 * payload). The resumed turn consumes the backfilled tool message as the
 * LLM's tool result and continues the parent.
 */
const fireSubAgentBridge = async (
  get: () => any,
  registration: SubAgentBridgeRegistration,
  resultContent: string,
): Promise<void> => {
  const { parentContext, parentOperationId, toolMessageId } = registration;

  // Guard: the parent must still be parked on this tool (its op stays
  // `running` across an async-tool park). If it was settled out-of-band
  // (user stopped the run, a newer run took over), a phantom continuation
  // would be worse than none — backfill only, no resume.
  const parentOp = get().operations[parentOperationId];
  if (!parentOp || parentOp.status !== 'running') {
    log(
      'parent %s no longer parked (status: %s), skipping resume',
      parentOperationId,
      parentOp?.status,
    );
    return;
  }

  // 1. Backfill the placeholder so the parent's conversation (rebuilt from
  //    persisted messages) sees the child's final output.
  await get().optimisticUpdateMessageContent(toolMessageId, resultContent, undefined, {
    operationId: parentOperationId,
  });

  // 2. Retire the parked parent op (the human-approval park does this in
  //    onRunParked; the async-tool park keeps it running by design, so the
  //    bridge retires it at resume time) and re-enter the runtime from the
  //    tool message position under a new operation.
  get().completeOperation(parentOperationId);

  await get().internal_resumeClientSubAgentParent({
    context: parentContext,
    parentMessageId: toolMessageId,
  });

  log('parent %s resumed with child result (%d chars)', parentOperationId, resultContent.length);
};

/**
 * Group-orchestration kind: deliver the member's final result into a fresh
 * `internal_execGroupOrchestration` re-entry seeded with the member's
 * `task_completed` result. The supervisor's next `decide()` then sees the
 * member's answer (its conversation was rebuilt with the backfilled tool
 * message) and drives the next round — the piece the old `result: undefined`
 * park-exit left permanently missing.
 */
const fireGroupOrchestrationBridge = async (
  get: () => any,
  registration: GroupOrchestrationBridgeRegistration,
  resultContent: string,
): Promise<void> => {
  const {
    messageContext,
    memberAgentId,
    orchestrationOperationId,
    supervisorAgentId,
    toolMessageId,
  } = registration;

  // The orchestration loop exited with a non-done state but its operation
  // stayed `running`; the re-entry mints a fresh operation, so retire the
  // parked one first (the human-approval "new op resumes the run" pattern).
  const parkedOp = get().operations[orchestrationOperationId];
  if (!parkedOp || parkedOp.status !== 'running') {
    log(
      'orchestration op %s not running (status: %s), skipping re-entry',
      orchestrationOperationId,
      parkedOp?.status,
    );
    return;
  }

  // Backfill the supervisor's group tool message BEFORE re-entering — the
  // re-entered orchestration rebuilds the supervisor conversation from
  // persisted messages, so the supervisor LLM call must see the result.
  await get().optimisticUpdateMessageContent(toolMessageId, resultContent, undefined, {
    operationId: orchestrationOperationId,
  });

  get().completeOperation(orchestrationOperationId);

  await get().internal_execGroupOrchestration({
    groupId: messageContext.groupId,
    initialResult: {
      payload: { agentId: memberAgentId, result: resultContent, success: true },
      type: 'task_completed',
    },
    supervisorAgentId,
    topicId: messageContext.topicId,
  });

  log(
    'orchestration %s re-entered after member %s settled',
    orchestrationOperationId,
    memberAgentId,
  );
};
