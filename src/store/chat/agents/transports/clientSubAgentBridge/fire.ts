import type { ConversationContext } from '@lobechat/types';
import debug from 'debug';

import { aiAgentService } from '@/services/aiAgent';
import { threadService } from '@/services/thread';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { aggregateSubagentMetrics } from '@/utils/subagentMetrics';

import {
  heldCompletions,
  registry,
  releasePending,
  scheduledBridgeRetries,
  trackPending,
} from './registry';
import {
  type ClientSubAgentBridgeRegistration,
  type GroupOrchestrationBridgeRegistration,
  type PersistedBridgeCoordinates,
  type SubAgentBridgeOutcome,
  type SubAgentBridgeRegistration,
} from './types';

const log = debug('lobe-store:client-subagent-bridge');

/**
 * Post-reload reconstruction: the in-memory registry has no claim for this
 * child thread, but a parked child outlives a reload — its isolation thread
 * row still carries the persisted bridge coordinates and is still
 * `processing` (settling the child clears it). Rebuild an ARMED registration
 * from the coordinates and re-arm the barrier slot. Armed because the
 * persisted coordinates only exist once the parent parked; the `processing`
 * status check is what prevents a settled bridge from re-firing.
 */
const reconstructRegistrationFromThread = async (
  childThreadId: string,
  childTopicId: string | undefined,
  // P2 (round-8): the sibling-rebuild loop already holds the full topic
  // thread list — pass it through instead of re-fetching the whole topic
  // once per sibling (N serial round-trips before the parent can resume).
  knownThreads?: Awaited<ReturnType<typeof threadService.getThreads>>,
): Promise<ClientSubAgentBridgeRegistration | undefined> => {
  if (!childTopicId) return undefined;
  try {
    const threads = knownThreads ?? (await threadService.getThreads(childTopicId));
    const thread = threads.find((t) => t.id === childThreadId);
    if (!thread) return undefined;

    // P1 (round-12): a settled child with SURVIVING coordinates is the
    // signature of a fire that crashed AFTER settlement (backfill / plugin
    // state / re-entry throw) — the success path clears the coordinates
    // right after `fireRegistration` resolves. A reload in that window used
    // to strand the parent forever, because this check rejected every
    // non-`processing` thread. Allow the continuation: re-firing settles an
    // already-settled child idempotently, and the parentParked guard (op
    // status / deferred placeholder) blocks phantom resumes of a parent that
    // already settled out-of-band.
    if (thread.status !== 'processing') {
      log(
        'bridge reconstruction on settled child %s (status=%s) — fire crashed after settlement, continuing the parent resume',
        childThreadId,
        thread.status,
      );
    }

    const bridge = (thread.metadata as { bridge?: PersistedBridgeCoordinates } | undefined)?.bridge;
    if (!bridge) return undefined;

    const childContext = {
      agentId: thread.agentId ?? undefined,
      ...(thread.groupId ? { groupId: thread.groupId } : {}),
      scope: 'thread',
      threadId: childThreadId,
      topicId: childTopicId,
    } as ClientSubAgentBridgeRegistration['childContext'];

    const registration: ClientSubAgentBridgeRegistration | undefined =
      bridge.kind === 'sub-agent'
        ? {
            armed: true,
            childContext,
            childOperationId: '',
            kind: 'sub-agent',
            parentContext:
              bridge.parentContext ?? ({} as ClientSubAgentBridgeRegistration['childContext']),
            parentOperationId: bridge.parentOperationId ?? '',
            toolMessageId: bridge.toolMessageId,
          }
        : {
            armed: true,
            childContext,
            childOperationId: '',
            kind: 'group-orchestration',
            memberAgentId: bridge.memberAgentId ?? childContext.agentId ?? '',
            messageContext:
              bridge.messageContext ?? ({} as ClientSubAgentBridgeRegistration['childContext']),
            orchestrationOperationId: bridge.orchestrationOperationId ?? '',
            supervisorAgentId: bridge.supervisorAgentId ?? '',
            supervisorSnapshot: bridge.supervisorSnapshot,
            toolMessageId: bridge.toolMessageId,
          };

    trackPending(registration);
    registry.set(childThreadId, registration);
    // P1 (round-7): a reload wipes the whole registry — reconstruct EVERY
    // parallel sibling parked on the same parent op too, or the first child
    // to finish tracks only itself and the barrier releases the parent while
    // its siblings are still running.
    // P1 (round-12): settled siblings with surviving coordinates are the
    // post-settlement-crash signature (see the top-of-function note) — they
    // must also reconstruct, or the barrier never releases for them.
    if (bridge.kind === 'sub-agent' && bridge.parentOperationId) {
      for (const sibling of threads) {
        if (sibling.id === childThreadId || registry.has(sibling.id)) continue;
        const siblingBridge = (
          sibling.metadata as { bridge?: PersistedBridgeCoordinates } | undefined
        )?.bridge;
        if (
          siblingBridge?.kind !== 'sub-agent' ||
          siblingBridge.parentOperationId !== bridge.parentOperationId
        )
          continue;
        await reconstructRegistrationFromThread(sibling.id, childTopicId, threads);
        log('bridge sibling reconstructed from thread row: key=%s', sibling.id);
      }
    }
    log('bridge reconstructed from thread row (armed): key=%s kind=%s', childThreadId, bridge.kind);
    return registration;
  } catch (error) {
    log('bridge: failed to reconstruct registration for %s: %O', childThreadId, error);
    return undefined;
  }
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
  context: ClientSubAgentBridgeRegistration['childContext'],
  outcome: SubAgentBridgeOutcome = { status: 'done' },
): Promise<void> => {
  const key = context.threadId;
  if (!key) return;

  let registration = registry.get(key);
  if (!registration) {
    // Post-reload path: the registry died with the renderer. The child
    // thread row still carries the persisted coordinates.
    registration =
      (await reconstructRegistrationFromThread(key, context.topicId ?? undefined)) ?? undefined;
  }
  if (!registration) return;

  // Two-phase activation (round-6): the spawner registers BEFORE the parent's
  // runtime assembles its deferred pause — with parallel tool lanes that gap
  // can span the whole sibling execution. A fire against an unarmed
  // registration means the child reached a terminal state while the parent
  // was still actively executing, so resuming now would race the parent's own
  // deferred path (which would overwrite the resumed turn with the "still
  // running" placeholder) and would count the barrier before every parallel
  // child has even registered. Hold the claim and the slot: arming happens
  // when the parent actually parks, and the claim stays live for the retry.
  if (!registration.armed) {
    // P1 (round-7): a parallel sibling lane can keep the parent from parking
    // past this child's terminal boundary. Hold the outcome — arming replays
    // it at the park; without this the parent parks forever (the child never
    // reaches a second terminal boundary).
    heldCompletions.set(key, outcome);
    log(
      'bridge fire deferred (not armed yet): key=%s kind=%s — waiting for the parent park',
      key,
      registration.kind,
    );
    return;
  }

  try {
    await fireRegistration(get, registration, outcome);
    // Settlement fully succeeded — only now is the claim final. On failure
    // the registration AND its barrier slot are put back below: a terminal
    // child run has no natural re-fire, so a dropped claim would leave the
    // parent parked forever with an unsettled placeholder.
    registry.delete(key);
    // A scheduled automatic retry (P1 round-10) is now obsolete — the bridge
    // settled through this fire. Cancel it so it doesn't re-fire pointlessly.
    const pendingRetry = scheduledBridgeRetries.get(key);
    if (pendingRetry) {
      clearTimeout(pendingRetry.timer);
      scheduledBridgeRetries.delete(key);
    }
    // Clear the persisted lifeline too — a settled bridge must never re-fire
    // after a reload. Best-effort: the `processing` status check on
    // reconstruction is the real guard (the settle path flips it).
    if (registration.childContext.topicId) {
      void threadService
        .getThreads(registration.childContext.topicId)
        .then((threads) => {
          const thread = threads.find((t) => t.id === key);
          if (!thread?.metadata || !('bridge' in thread.metadata)) return;
          const { bridge: _cleared, ...rest } = thread.metadata as Record<string, unknown>;
          return threadService.updateThread(key, { metadata: rest as any });
        })
        .catch((error) => log('bridge: failed to clear persisted coordinates: %O', error));
    }
  } catch (error) {
    // Restore BOTH pieces (registry claim + barrier slot) so the retry sees
    // the exact pre-fire state. Asymmetric restore made sibling B resume the
    // parent while A's backfill was still pending: B appeared to be the last
    // child, resumed and completed the parent, and A's later retry was then
    // rejected by the non-running-parent guard before it could backfill.
    registry.set(key, registration);
    trackPending(registration);
    log('bridge failed for key %s (claim + barrier slot restored for retry): %O', key, error);
    // P1 (round-10/11): a restored claim has no driver — the child's terminal
    // boundary was the only production caller and has already completed, so
    // without a scheduled re-fire the parent stays parked forever. Schedule a
    // bounded burst of automatic retries first (4 × 5s×attempt), then fall
    // back to a slow 60s poll that never stops (clearing any earlier timer
    // for this key first, so failures don't stack timers). The poll IS the
    // production driver after exhaustion: reconstruction only runs inside a
    // fire, so a restored claim + persisted coordinates alone cannot initiate
    // recovery. Every exit from the fire path cancels the timer (success) or
    // reschedules it (failure) — no entry is ever left without a driver.
    const previous = scheduledBridgeRetries.get(key);
    if (previous) clearTimeout(previous.timer);
    const attempt = (previous?.attempt ?? 0) + 1;
    const delay = attempt <= 4 ? 5000 * attempt : 60_000;
    const timer = setTimeout(() => {
      log('bridge scheduled retry %d firing for key %s (delay %dms)', attempt, key, delay);
      void fireClientSubAgentBridge(get, context, outcome);
    }, delay);
    scheduledBridgeRetries.set(key, { attempt, timer });
    log('bridge retry %d scheduled in %dms for key %s', attempt, delay, key);
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
  // P2 (round-9): the settlement is the ONLY path that clears the child's
  // `processing` status. Swallowing a transient rejection here left the
  // thread permanently displayed and polled as running while the fire
  // continued into the parent resume and the success path deleted the
  // registration + persisted coordinates — no retry could ever settle it.
  // Bounded retry (3 attempts, linear backoff), then rethrow so the outer
  // catch restores the registry claim + barrier slot and keeps the persisted
  // coordinates — the next terminal boundary or a post-reload reconstruction
  // can re-fire the bridge and settle the thread.
  const settleThread = async (): Promise<void> => {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await aiAgentService.updateClientTaskThreadStatus({
          // P2 (round-8): pass the terminal outcome verbatim — the server maps
          // `interrupted` to ThreadStatus.Cancel; recording it as `error`
          // persisted a cancelled child as failed.
          completionReason: outcome.status,
          error: succeeded ? undefined : resultContent,
          metadata: {
            // P2 (round-8): include the child's final cost — the settlement
            // overwrites thread.metadata.totalCost, so omitting it zeroed the
            // parked child's spend on refresh (ordinary completion paths
            // persist it).
            totalCost: outcome.cost,
            totalMessages: threadMessages.length,
            totalTokens: metrics.totalTokens,
            totalToolCalls: metrics.toolCalls,
          },
          resultContent,
          threadId: childThreadId!,
        });
        return;
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        log(
          'bridge: thread settlement attempt %d/%d failed for %s, retrying: %O',
          attempt,
          maxAttempts,
          childThreadId,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  await settleThread();

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

  // Guard: the parent must still be parked on this tool. In-session the op
  // stays `running` across an async-tool park; after a reload the op is gone,
  // but the parent's tool row still carries the deferred `running` plugin
  // state — that is the durable equivalent. If either signal says the parent
  // settled out-of-band (user stopped the run, a newer run took over), a
  // phantom continuation would be worse than none — backfill only, no
  // resume. The barrier slot is released so sibling children are not blocked
  // by a dead parent.
  const parentOp = get().operations[parentOperationId];
  const parentParked = parentOp
    ? parentOp.status === 'running'
    : isDeferredPlaceholderStillRunning(get, registration.parentContext, toolMessageId);
  if (!parentParked) {
    log(
      'parent %s no longer parked (op status: %s), skipping resume',
      parentOperationId,
      parentOp?.status ?? 'missing',
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
  // P2 (round-7): MERGE over the current plugin state — the deferred state's
  // threadId carries the Open Thread coordinates; a blind replace drops it
  // the moment the child settles.
  const parentToolRows: Array<{ id?: string; pluginState?: Record<string, any> }> =
    get().dbMessagesMap[messageMapKey(registration.parentContext)] || [];
  const parentToolRow = parentToolRows.find((m) => m.id === toolMessageId);
  await get().optimisticUpdatePluginState(toolMessageId, {
    ...parentToolRow?.pluginState,
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
  // P1 (round-8): complete the parked parent op only AFTER re-entry
  // succeeds. Completing it first meant a resumeClientSubAgentParent throw
  // left the parent permanently unresumable: the outer catch restored the
  // claim + barrier slot, but every retry hit the `parentOp.status ===
  // 'running'` guard — actually `!parentParked` — and skipped the resume,
  // so no re-fire (automatic or manual) could recover. Keeping the op
  // running until re-entry succeeds makes every retry retryable.
  await resumeClientSubAgentParent(get, parentContext, toolMessageId);

  get().completeOperation(parentOperationId);

  log('parent %s resumed with child result (%d chars)', parentOperationId, resultContent.length);
};

/**
 * Durable park signal for the post-reload path: the parent operation is gone,
 * but the deferred placeholder's plugin state (`{ status: 'running', threadId
 * }`) is persisted on the tool row. `running` means the parent never settled
 * — still parked. Anything else (completed / error) means it settled
 * out-of-band and a resume would be a phantom.
 */
const isDeferredPlaceholderStillRunning = (
  get: () => any,
  parentContext: ClientSubAgentBridgeRegistration['childContext'],
  toolMessageId: string,
): boolean => {
  const messages: Array<{ id?: string; pluginState?: { status?: string } }> =
    get().dbMessagesMap[messageMapKey(parentContext)] || [];
  const toolRow = messages.find((m) => m.id === toolMessageId);
  return toolRow?.pluginState?.status === 'running';
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
  // After a reload the op is gone — the group tool row's deferred `running`
  // plugin state is the durable park signal (same rule as the sub-agent
  // kind). If either signal says the orchestration settled out-of-band, the
  // re-entry would double-drive the supervisor: backfill only.
  // The barrier slot is released too — the re-entry carries the whole
  // decision, so pending siblings of this parent op must not block it.
  const parkedOp = get().operations[orchestrationOperationId];
  const orchestrationParked = parkedOp
    ? parkedOp.status === 'running'
    : isDeferredPlaceholderStillRunning(get, messageContext, toolMessageId);
  if (!orchestrationParked) {
    log(
      'orchestration op %s not running (status: %s), skipping re-entry',
      orchestrationOperationId,
      parkedOp?.status ?? 'missing',
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
  // P2 (round-7): MERGE over the current plugin state — same contract as the
  // sub-agent kind (see above).
  const groupToolRows: Array<{ id?: string; pluginState?: Record<string, any> }> =
    get().dbMessagesMap[messageMapKey(registration.messageContext)] || [];
  const groupToolRow = groupToolRows.find((m) => m.id === toolMessageId);
  await get().optimisticUpdatePluginState(toolMessageId, {
    ...groupToolRow?.pluginState,
    status: succeeded ? 'completed' : 'error',
    ...stats,
  });

  // Release this member's barrier slot BEFORE re-entering: the re-entry
  // carries the whole decision, so a surviving slot would leak for the
  // lifetime of the tab (the registry claim is deleted by the caller, but
  // the module-level pendingByParentOp set stays reachable without this).
  releasePending(registration);

  // P1 (round-8): retire the parked orchestration op only AFTER the re-entry
  // succeeds — same recovery hole as the sub-agent kind: completing it first
  // let an internal_execGroupOrchestration throw leave the parked op
  // permanently unresumable, since every retry then failed the
  // `orchestrationParked` guard. Retiring after keeps the retry path alive.
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

  get().completeOperation(orchestrationOperationId);

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
  parentContext: ClientSubAgentBridgeRegistration['childContext'],
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

/**
 * Arm every bridge registration parked on THIS run: the run just entered
 * `waiting_for_async_tool`, which is the point where the deferred placeholder
 * is authoritative and the parent will not settle on its own anymore. Called
 * from the parked branch of the client run boundary — BEFORE this point a
 * registration must stay unarmed because the parent may still be executing
 * other tool lanes (the deferred pause only assembles after ALL lanes of the
 * step settle), and resuming early would let the parent's own deferred path
 * overwrite the resumed turn with the "still running" placeholder.
 *
 * Scanning the run's own message bucket for tool rows whose plugin state
 * carries a child threadId (the deferred callSubAgent shape) is what makes
 * the ordering explicit: a parallel lane's callSubAgent that has NOT returned
 * its deferred result yet has no `running` plugin state row here, so its
 * registration (if it registers later) waits for ITS park — the barrier only
 * counts armed siblings.
 *
 * P1 fix (round-7): arming also replays completions HELD at the child's
 * terminal boundary because a parallel lane still kept the parent from
 * parking — the child has no second terminal boundary, so without the replay
 * the parent would park forever.
 */
export const armClientSubAgentBridgesForContext = (
  get: () => any,
  context: ConversationContext,
): void => {
  const chatKey = messageMapKey(context);
  const messages: Array<{ pluginState?: { status?: string; threadId?: string }; role?: string }> =
    get().dbMessagesMap[chatKey] || [];

  for (const message of messages) {
    if (message.role !== 'tool') continue;
    const state = message.pluginState;
    if (state?.status !== 'running' || !state.threadId) continue;

    const registration = registry.get(state.threadId);
    if (!registration || registration.armed) continue;

    registry.set(state.threadId, { ...registration, armed: true });
    log('bridge armed: key=%s kind=%s', state.threadId, registration.kind);

    // Replay the completion that arrived before the park (P1 round-7). The
    // fire's own CAS deletes the claim on success; a failure restores both
    // claim and slot for the retry.
    const held = heldCompletions.get(state.threadId);
    if (!held) continue;
    heldCompletions.delete(state.threadId);
    log('bridge replaying held completion at park: key=%s', state.threadId);
    void fireClientSubAgentBridge(get, registration.childContext, held);
  }
};
