import type { GroupOrchestrationSupervisorSnapshot as SupervisorSnapshot } from '@lobechat/agent-runtime';
import { type ConversationContext } from '@lobechat/types';
import debug from 'debug';

import { aiAgentService } from '@/services/aiAgent';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { aggregateSubagentMetrics } from '@/utils/subagentMetrics';

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
  /**
   * Supervisor state machine counters at the park point (round /
   * skip-call-supervisor). Carried into the re-entry's task_completed payload
   * so the resumed loop continues from the original decision point instead of
   * resetting to a fresh supervisor machine.
   */
  supervisorSnapshot?: SupervisorSnapshot;
  /** Message id of the supervisor's group task tool message. */
  toolMessageId: string;
}

export type ClientSubAgentBridgeRegistration =
  GroupOrchestrationBridgeRegistration | SubAgentBridgeRegistration;

/** Terminal disposition of the child run, captured at the run boundary. */
export interface SubAgentBridgeOutcome {
  /** Cost of the child run (`AgentState.cost.total`), for the parent ledger. */
  cost?: number;
  error?: string;
  /** Terminal AgentState.status of the child run: done | error | interrupted. */
  status: 'done' | 'error' | 'interrupted';
  /** Token split of the child run (`AgentState.usage.llm.tokens`). */
  usage?: { input?: number; output?: number; total?: number };
}

const registry = new Map<string, ClientSubAgentBridgeRegistration>();

/**
 * Parallel-call barrier: one parent turn may emit several `callSubAgent`
 * calls (systemRole documents parallel dispatch). All of them park the same
 * parent op, so the parent may only resume after the LAST child settles.
 * Keyed by the shared parked parent op id; each registration carries its own
 * tool message, so backfills stay per-child while the resume is barriered.
 */
const pendingByParentOp = new Map<string, Set<string>>();

/**
 * Test-only reset: the registry is module-level shared state, and a restored
 * claim (retry semantics) must not leak across test cases. Not exported from
 * the package index.
 */
export const __resetBridgeForTests = (): void => {
  registry.clear();
  pendingByParentOp.clear();
};

const trackPending = (registration: ClientSubAgentBridgeRegistration) => {
  const parentOpId =
    registration.kind === 'sub-agent'
      ? registration.parentOperationId
      : registration.orchestrationOperationId;
  let pending = pendingByParentOp.get(parentOpId);
  if (!pending) {
    pending = new Set<string>();
    pendingByParentOp.set(parentOpId, pending);
  }
  pending.add(registration.toolMessageId);
};

const releasePending = (registration: ClientSubAgentBridgeRegistration): boolean => {
  const parentOpId =
    registration.kind === 'sub-agent'
      ? registration.parentOperationId
      : registration.orchestrationOperationId;
  const pending = pendingByParentOp.get(parentOpId);
  if (!pending) return true;
  pending.delete(registration.toolMessageId);
  if (pending.size === 0) {
    pendingByParentOp.delete(parentOpId);
    return true;
  }
  return false;
};

const registryKey = (childContext: ConversationContext): string | undefined =>
  childContext.threadId ?? undefined;

export const registerClientSubAgentBridge = (registration: ClientSubAgentBridgeRegistration) => {
  const key = registryKey(registration.childContext);
  if (!key) {
    log('bridge registration skipped: child context has no threadId');
    return;
  }
  registry.set(key, registration);
  trackPending(registration);
  log(
    'bridge registered: key=%s kind=%s toolMessage=%s',
    key,
    registration.kind,
    registration.toolMessageId,
  );
};

/**
 * Spawner-side registration for `runClientSubAgent` (streamingExecutor): the
 * parked child's context + the parent run's coordinates. Kept here so the
 * oversized streamingExecutor file only carries a one-line call — AGENTS.md
 * forbids growing files already over the 800-line limit.
 */
export const registerSubAgentBridgeFromSpawner = (params: {
  childContext: ConversationContext;
  childOperationId: string;
  /**
   * Operation lookup — the bridge reads the FULL parent context
   * (threadId / scope / documentId / workspaceSlug / groupId …) from
   * `getParentOperation(parentOperationId)?.context` itself, so the resume
   * reconstructs the parent's message bucket in the original scope. A
   * spawner-side trimmed context made thread- and page-scoped parents resume
   * into the main-topic bucket (messageMapKey isolation).
   */
  getParentOperation: (
    parentOperationId: string,
  ) => { context?: unknown; status: string } | undefined;
  parentAgentId: string;
  parentOperationId?: string;
  toolMessageId: string;
}): void => {
  const {
    childContext,
    childOperationId,
    getParentOperation,
    parentAgentId,
    parentOperationId,
    toolMessageId,
  } = params;

  // No parent op id (legacy spawner) → no bridge to hang the resume on.
  if (!parentOperationId) return;
  const parentOp = getParentOperation(parentOperationId);
  if (!parentOp) return;

  registerClientSubAgentBridge({
    childContext,
    childOperationId,
    kind: 'sub-agent',
    parentContext: {
      // Full parent context (see doc above); agentId pinned to the spawner's
      // value. The operation context extends ConversationContext.
      ...(parentOp.context as ConversationContext | undefined),
      agentId: parentAgentId,
    },
    parentOperationId,
    toolMessageId,
  });
};

/**
 * Member-side registration for the group-orchestration park-exit: the parked
 * member's context + the orchestration's coordinates. Same size rationale as
 * the spawner-side helper above.
 */
export const registerGroupBridgeFromParkExit = (params: {
  childContext: ConversationContext;
  childOperationId: string;
  memberAgentId: string;
  messageContext: ConversationContext;
  orchestrationOperationId: string;
  supervisorAgentId: string;
  /** Supervisor counters at the park point, restored by the re-entry. */
  supervisorSnapshot?: SupervisorSnapshot;
  toolMessageId: string;
}): void => {
  registerClientSubAgentBridge({
    childContext: params.childContext,
    childOperationId: params.childOperationId,
    kind: 'group-orchestration',
    memberAgentId: params.memberAgentId,
    messageContext: params.messageContext,
    orchestrationOperationId: params.orchestrationOperationId,
    supervisorAgentId: params.supervisorAgentId,
    supervisorSnapshot: params.supervisorSnapshot,
    toolMessageId: params.toolMessageId,
  });
};

/**
 * Fire the completion bridge for a child run that just reached a terminal
 * state. Fire-and-forget: errors are logged, never thrown — a bridge failure
 * must not fail the child's own completion. Without the server bridge's
 * queue redelivery a failed claim is dropped, but a bridge only exists after
 * a park, and the failure is logged loudly for diagnosis.
 *
 * Barrier-slot lifecycle: the slot is released exactly once per registration
 * — by the settle path, only after settlement actually succeeded (or the
 * parent was found settled out-of-band, where no retry can help). The outer
 * catch restores BOTH the registry claim and the barrier slot, so the retry
 * sees the exact pre-fire state and sibling children cannot resume the
 * parent ahead of a still-pending child.
 */
export const fireClientSubAgentBridge = async (
  get: () => any,
  context: ConversationContext,
  outcome: SubAgentBridgeOutcome = { status: 'done' },
): Promise<void> => {
  const key = context.threadId;
  if (!key) return;

  const registration = registry.get(key);
  if (!registration) return;

  try {
    await fireRegistration(get, registration, outcome);
    // Settlement fully succeeded — only now is the claim final. On failure
    // the registration AND its barrier slot are put back below: a terminal
    // child run has no natural re-fire, so a dropped claim would leave the
    // parent parked forever with an unsettled placeholder.
    registry.delete(key);
  } catch (error) {
    // Restore BOTH pieces (registry claim + barrier slot) so the retry sees
    // the exact pre-fire state. Asymmetric restore made sibling B resume the
    // parent while A's backfill was still pending: B appeared to be the last
    // child, resumed and completed the parent, and A's later retry was then
    // rejected by the non-running-parent guard before it could backfill.
    registry.set(key, registration);
    trackPending(registration);
    log('bridge failed for key %s (claim + barrier slot restored for retry): %O', key, error);
  }
};

const fireRegistration = async (
  get: () => any,
  registration: ClientSubAgentBridgeRegistration,
  outcome: SubAgentBridgeOutcome,
): Promise<void> => {
  const childOp = get().operations[registration.childOperationId];
  const childThreadId = registration.childContext.threadId;

  // The child's final output: read from its isolation thread messages.
  const threadMessages = childThreadId
    ? get().dbMessagesMap[messageMapKey(registration.childContext)] || []
    : [];
  const lastAssistant = threadMessages.findLast?.((m: any) => m.role === 'assistant');

  // Preserve terminal disposition: a failed/interrupted continuation must
  // not reach the parent disguised as a successful answer (which could even
  // be stale pre-failure content). The parent sees the failure honestly.
  const succeeded = outcome.status === 'done';
  const resultContent = succeeded
    ? lastAssistant?.content ||
      'Sub-agent finished without a text answer. Check its thread for details.'
    : outcome.error
      ? `Sub-agent run ${outcome.status === 'interrupted' ? 'was interrupted' : 'failed'}: ${outcome.error}`
      : `Sub-agent run ${outcome.status === 'interrupted' ? 'was interrupted' : 'failed'}. Check its thread for details.`;

  // Terminal stats from the child's own thread messages — the same
  // aggregation the normal completion path and the inspector chip use, so
  // the bridge (the authoritative stats writer per the CallSubAgentState
  // contract) can't diverge from the live projection. Token split and cost
  // come from the run boundary's AgentState (the per-message aggregation
  // can't see cost), matching the normal path's flat stats exactly — once
  // flat totals exist, calculateOperationUsageMetrics stops falling back to
  // the live progress object, so a missing split would report zero cost.
  const metrics = aggregateSubagentMetrics(threadMessages);
  const stats = {
    model: metrics.model,
    totalCost: outcome.cost,
    totalInputTokens: outcome.usage?.input,
    totalOutputTokens: outcome.usage?.output,
    totalTokens: (outcome.usage?.total ?? metrics.totalTokens) || undefined,
    totalToolCalls: metrics.toolCalls,
  };

  log(
    'bridge firing: key=%s kind=%s status=%s result=%d chars',
    childThreadId,
    registration.kind,
    outcome.status,
    resultContent.length,
  );

  // The parked child op itself never completed (parking skips terminal
  // side effects and the resume runs under a new operation) — retire it so
  // it does not linger as a zombie running op.
  if (childOp?.status === 'running') {
    get().completeOperation(registration.childOperationId);
  }

  // Settle the child thread (status + metadata) — the parked child skipped
  // the normal completion path's updateClientTaskThreadStatus, so without
  // this the thread list / sidebar shows processing forever.
  try {
    await aiAgentService.updateClientTaskThreadStatus({
      completionReason: succeeded ? 'done' : 'error',
      error: succeeded ? undefined : resultContent,
      metadata: {
        totalMessages: threadMessages.length,
        totalTokens: metrics.totalTokens,
        totalToolCalls: metrics.toolCalls,
      },
      resultContent,
      threadId: childThreadId!,
    });
  } catch (error) {
    log('bridge: thread settlement failed for %s: %O', childThreadId, error);
  }

  if (registration.kind === 'sub-agent') {
    await fireSubAgentBridge(get, registration, resultContent, succeeded, stats);
  } else {
    await fireGroupOrchestrationBridge(get, registration, resultContent, succeeded, stats);
  }
};
/**
 * Sub-agent kind: backfill the parent's placeholder tool message, persist the
 * authoritative completion state + thread settlement (the normal completion
 * path's step-8 shape — the parked child skipped it), then resume the parked
 * parent run from the tool message position — but only when this child is
 * the LAST pending one on the shared parent op (parallel-call barrier).
 */
const fireSubAgentBridge = async (
  get: () => any,
  registration: SubAgentBridgeRegistration,
  resultContent: string,
  succeeded: boolean,
  stats: Record<string, number | string | undefined>,
): Promise<void> => {
  const { parentContext, parentOperationId, toolMessageId } = registration;

  // Guard: the parent must still be parked on this tool (its op stays
  // `running` across an async-tool park). If it was settled out-of-band
  // (user stopped the run, a newer run took over), a phantom continuation
  // would be worse than none — backfill only, no resume. The barrier slot
  // is released so sibling children are not blocked by a dead parent.
  const parentOp = get().operations[parentOperationId];
  if (!parentOp || parentOp.status !== 'running') {
    log(
      'parent %s no longer parked (status: %s), skipping resume',
      parentOperationId,
      parentOp?.status,
    );
    releasePending(registration);
    return;
  }

  // 1. Backfill the placeholder so the parent's conversation (rebuilt from
  //    persisted messages) sees the child's final output.
  await get().optimisticUpdateMessageContent(toolMessageId, resultContent, undefined, {
    operationId: parentOperationId,
  });

  // 2. Persist the authoritative completion state on the tool message —
  //    replaces the deferred `{ status: 'running', threadId }` placeholder
  //    state, feeds the Inspector row, and mirrors the normal path's write.
  //    Flat stats ride on the SAME state object (CallSubAgentState contract:
  //    the completion bridge is the authoritative stats writer).
  await get().optimisticUpdatePluginState(toolMessageId, {
    status: succeeded ? 'completed' : 'error',
    ...stats,
  });

  // 4. Parallel-call barrier: resume the parent only after the LAST pending
  //    child on this parent op settles. Earlier completions still backfill
  //    their own tool message above.
  if (!releasePending(registration)) {
    log('parent %s still waiting on other parked children, resume deferred', parentOperationId);
    return;
  }

  // 5. Retire the parked parent op (the human-approval park does this in
  //    onRunParked; the async-tool park keeps it running by design, so the
  //    bridge retires it at resume time) and re-enter the runtime from the
  //    tool message position under a new operation.
  get().completeOperation(parentOperationId);

  await resumeClientSubAgentParent(get, parentContext, toolMessageId);

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
  succeeded: boolean,
  stats: Record<string, number | string | undefined>,
): Promise<void> => {
  const {
    memberAgentId,
    messageContext,
    orchestrationOperationId,
    supervisorAgentId,
    supervisorSnapshot,
    toolMessageId,
  } = registration;

  // The orchestration loop exited with a non-done state but its operation
  // stayed `running`; the re-entry mints a fresh operation, so retire the
  // parked one first (the human-approval "new op resumes the run" pattern).
  // The barrier slot is released too — the re-entry carries the whole
  // decision, so pending siblings of this parent op must not block it.
  const parkedOp = get().operations[orchestrationOperationId];
  if (!parkedOp || parkedOp.status !== 'running') {
    log(
      'orchestration op %s not running (status: %s), skipping re-entry',
      orchestrationOperationId,
      parkedOp?.status,
    );
    releasePending(registration);
    return;
  }

  // Backfill the supervisor's group tool message BEFORE re-entering — the
  // re-entered orchestration rebuilds the supervisor conversation from
  // persisted messages, so the supervisor LLM call must see the result.
  await get().optimisticUpdateMessageContent(toolMessageId, resultContent, undefined, {
    operationId: orchestrationOperationId,
  });

  // Persist the authoritative completion state on the tool message (the
  // member's card) — same contract as the sub-agent kind, including the
  // flat spend stats the usage tray reads.
  await get().optimisticUpdatePluginState(toolMessageId, {
    status: succeeded ? 'completed' : 'error',
    ...stats,
  });

  // Release this member's barrier slot BEFORE re-entering: the re-entry
  // carries the whole decision, so a surviving slot would leak for the
  // lifetime of the tab (the registry claim is deleted by the caller, but
  // the module-level pendingByParentOp set stays reachable without this).
  releasePending(registration);

  get().completeOperation(orchestrationOperationId);

  await get().internal_execGroupOrchestration({
    groupId: messageContext.groupId,
    initialResult: {
      payload: {
        agentId: memberAgentId,
        result: resultContent,
        // A failed/interrupted member must not drive the supervisor forward
        // as a success — the supervisor decides how to react to the failure.
        success: succeeded,
        // Restore the supervisor machine to its pre-park decision point: a
        // fresh machine would replay the consumed `supervisor_decided`
        // (deterministically re-calling the supervisor the original run had
        // already driven) and restart the round budget.
        ...(supervisorSnapshot ? { supervisorSnapshot } : {}),
      },
      type: 'task_completed',
    },
    supervisorAgentId,
    topicId: messageContext.topicId,
  });

  log(
    'orchestration %s re-entered after member %s settled (status=%s)',
    orchestrationOperationId,
    memberAgentId,
    succeeded ? 'done' : 'failed',
  );
};

/**
 * Completion-bridge resume entry: continue a parent run parked on a deferred
 * tool (a sub-agent that finished after parking the parent). Re-enters the
 * runtime from the tool message position with phase `tool_result` — the same
 * re-entry shape the human-approval resume uses, minus the approval payload.
 * The backfilled tool message is already persisted; the resumed turn consumes
 * it as the LLM's tool result.
 *
 * Lives here (not on the streaming executor) so the bridge is one
 * self-contained unit — the runtime wiring it needs (startOperation /
 * internal_createAgentState / executeClientAgent) all ride on the same store
 * `get`.
 */
const resumeClientSubAgentParent = async (
  get: () => any,
  parentContext: ConversationContext,
  parentMessageId: string,
): Promise<void> => {
  const { agentId, topicId, threadId } = parentContext;

  const { operationId } = get().startOperation({
    context: {
      ...parentContext,
      messageId: parentMessageId,
    },
    label: 'Sub-agent completion resume',
    type: 'execAgentRuntime',
  } as any);

  get().associateMessageWithOperation(parentMessageId, operationId);

  // Select the resumed messages from the FULL parent context — the bucket key
  // must be rebuilt from the same fields the registration preserved (scope /
  // documentId / groupId / threadId). A reduced { agentId, topicId, threadId }
  // key collapsed page- and group-scoped parents into the main bucket, so the
  // resumed state lost the parent history and the backfilled tool result.
  const chatKey = messageMapKey(parentContext);
  const currentMessages = get().dbMessagesMap[chatKey] || [];

  const { context: initialContext, state } = get().internal_createAgentState({
    agentId,
    messages: currentMessages,
    operationId,
    parentMessageId,
    threadId: threadId ?? undefined,
    topicId,
  });

  // The resumed parent may park AGAIN (another deferred tool / callSubAgent in
  // its continuation). The wrapper operation's job ends once the runtime child
  // operation owns the continuation: executeClientAgent mints that child
  // (chained to the wrapper) and the next bridge registration references the
  // child, which stays `running` across the park. Completing the wrapper in
  // BOTH cases (terminal and re-park, success or throw) keeps operation
  // selectors from treating the conversation as busy forever.
  try {
    await get().executeClientAgent({
      context: parentContext,
      parentOperationId: operationId,
      initialContext: {
        ...initialContext,
        payload: { parentMessageId },
        phase: 'tool_result',
      },
      initialState: state,
      messages: currentMessages,
      parentMessageId,
      parentMessageType: 'tool',
      // No `skipCreateFirstMessage`: seeding the tool row as the assistant
      // placeholder made the resumed LLM answer stream INTO the tool row,
      // overwriting the child result just backfilled. Let the runtime create
      // a fresh assistant row (the human-approval resume path does the same).
    });
  } finally {
    get().completeOperation(operationId);
  }
};
