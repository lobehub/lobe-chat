import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetBridgeForTests,
  armClientSubAgentBridgesForContext,
  fireClientSubAgentBridge,
  registerClientSubAgentBridge,
  registerGroupBridgeFromParkExit,
} from '../clientSubAgentBridge';

beforeEach(() => {
  // The registry is module-level; a restored claim (retry semantics) from one
  // case must never leak into the next.
  __resetBridgeForTests();
});

const childContext = { agentId: 'agent-a', threadId: 'thd_child', topicId: 'topic-1' } as any;
const childContextTopicId = 'topic-1';

const makeGet = (overrides: Record<string, any> = {}) => {
  const store = {
    completeOperation: vi.fn(),
    dbMessagesMap: {
      // messageMapKey for the thread scope of childContext
      'thread_agent-a_topic-1_thd_child': [
        { content: 'child final answer', role: 'user' },
        { content: 'child final answer', role: 'assistant' },
      ],
    },
    executeClientAgent: vi.fn().mockResolvedValue(undefined),
    internal_createAgentState: vi.fn().mockReturnValue({ context: {}, state: {} }),
    internal_execGroupOrchestration: vi.fn().mockResolvedValue(undefined),
    associateMessageWithOperation: vi.fn(),
    operations: {
      op_child: { status: 'running' },
      op_parent: { status: 'running' },
      op_orch: { status: 'running' },
    },
    optimisticUpdateMessageContent: vi.fn().mockResolvedValue(undefined),
    optimisticUpdatePluginState: vi.fn().mockResolvedValue(undefined),
    startOperation: vi.fn().mockReturnValue({ operationId: 'op_resume' }),
    ...overrides,
  } as any;
  return { get: () => store, store };
};

const subAgentRegistration = {
  childContext,
  childOperationId: 'op_child',
  kind: 'sub-agent' as const,
  parentContext: { agentId: 'agent-parent', topicId: 'topic-1' } as any,
  parentOperationId: 'op_parent',
  toolMessageId: 'tool-msg-1',
};

const groupRegistration = {
  childContext,
  childOperationId: 'op_child',
  kind: 'group-orchestration' as const,
  memberAgentId: 'agent-a',
  messageContext: {
    agentId: 'supervisor',
    groupId: 'group-1',
    scope: 'group',
    topicId: 'topic-1',
  } as any,
  orchestrationOperationId: 'op_orch',
  supervisorAgentId: 'supervisor',
  toolMessageId: 'tool-msg-1',
};

vi.mock('@/services/aiAgent', () => ({
  aiAgentService: {
    updateClientTaskThreadStatus: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/thread', () => ({
  threadService: {
    getThreads: vi.fn().mockResolvedValue([]),
    updateThread: vi.fn().mockResolvedValue(undefined),
  },
}));

/**
 * Round-6: registrations arm at the PARENT's park. Most existing tests model
 * the already-parked state (they assert the fire/resume behavior), so this
 * helper registers and immediately arms — the shape
 * `registerClientSubAgentBridge` + `armClientSubAgentBridgesForContext`
 * produces in production.
 */
const registerArmedSubAgentBridge = (
  registration: Parameters<typeof registerClientSubAgentBridge>[0],
) => {
  registerClientSubAgentBridge(registration);
  // Simulate the parent's park: a deferred placeholder row in the parent
  // bucket carrying this child's threadId is what the arm scan matches.
  const threadId = registration.childContext.threadId as string;
  const agentId = (registration as any).parentContext?.agentId ?? 'agent-parent';
  const topicId = (registration as any).parentContext?.topicId ?? childContextTopicId;
  armClientSubAgentBridgesForContext(
    () =>
      ({
        dbMessagesMap: {
          [`main_${agentId}_${topicId}`]: [
            {
              id: (registration as any).toolMessageId,
              pluginState: { status: 'running', threadId },
              role: 'tool',
            },
          ],
        },
      }) as any,
    { agentId, topicId } as any,
  );
};

describe('clientSubAgentBridge', () => {
  it('sub-agent kind: backfills the tool message, retires the parked ops, resumes the parent', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-1',
      'child final answer',
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store.completeOperation).toHaveBeenCalledWith('op_child');
    expect(store.completeOperation).toHaveBeenCalledWith('op_parent');
    // Resume re-enters the runtime from the tool message position under a
    // fresh operation (the bridge owns the resume entry).
    expect(store.startOperation).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'execAgentRuntime' }),
    );
    expect(store.executeClientAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        parentMessageId: 'tool-msg-1',
        parentMessageType: 'tool',
      }),
    );
    // The runtime creates a FRESH assistant row for the resumed answer —
    // seeding the tool row as the placeholder would stream the LLM answer
    // into the tool row and overwrite the backfilled child result.
    expect(store.executeClientAgent.mock.calls[0][0]).not.toHaveProperty(
      'skipCreateFirstMessage',
      true,
    );
  });

  it('group-orchestration kind: backfills the group tool message and re-enters the loop with task_completed', async () => {
    registerClientSubAgentBridge({ ...groupRegistration, armed: true });
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-1',
      'child final answer',
      undefined,
      { operationId: 'op_orch' },
    );
    expect(store.completeOperation).toHaveBeenCalledWith('op_orch');
    expect(store.internal_execGroupOrchestration).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: 'group-1',
        initialResult: {
          payload: { agentId: 'agent-a', result: 'child final answer', success: true },
          type: 'task_completed',
        },
        supervisorAgentId: 'supervisor',
        topicId: 'topic-1',
      }),
    );
  });

  // The parked child resumes out-of-band under a new operation, so the fire
  // context may differ from the registration's child context — but they share
  // the same threadId, which is the registry key.
  it('fires when the resuming run shares the child thread, from a different context object', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get } = makeGet();

    const resumedContext = { ...childContext, agentId: 'agent-a' } as any;
    await fireClientSubAgentBridge(get, resumedContext);

    const { store } = makeGet();
    void store;
    // No throw + registry drained: a second fire in the same thread is a no-op.
    const { store: store2 } = makeGet();
    await fireClientSubAgentBridge(() => store2, childContext);
    expect(store2.optimisticUpdateMessageContent).not.toHaveBeenCalled();
  });

  it('skips the parent resume when the parent op is no longer running', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet({
      operations: {
        op_child: { status: 'running' },
        op_parent: { status: 'cancelled' },
      },
    });

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
    expect(store.executeClientAgent).not.toHaveBeenCalled();
  });

  it('is a no-op when no bridge was registered for the thread (normal terminal runs)', async () => {
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
    expect(store.completeOperation).not.toHaveBeenCalled();
  });

  it('never throws: a bridge failure must not fail the child run boundary', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get } = makeGet({
      optimisticUpdateMessageContent: vi.fn().mockRejectedValue(new Error('db down')),
    });

    await expect(fireClientSubAgentBridge(get, childContext)).resolves.toBeUndefined();
  });

  it('skips registration when the child context has no threadId', async () => {
    registerArmedSubAgentBridge({
      ...subAgentRegistration,
      childContext: { ...childContext, threadId: undefined } as any,
    });
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
  });

  // Parallel dispatch: two callSubAgent calls in one turn share the parent op.
  // The FIRST child to finish must backfill its own message but NOT resume the
  // parent; only the LAST one triggers the resume.
  it('parallel barrier: first finishing child backfills but defers the parent resume', async () => {
    const childA = { ...childContext, threadId: 'thd_child_a' } as any;
    const childB = { ...childContext, threadId: 'thd_child_b' } as any;
    const regA = {
      ...subAgentRegistration,
      childContext: childA,
      toolMessageId: 'tool-msg-a',
    };
    const regB = {
      ...subAgentRegistration,
      childContext: childB,
      toolMessageId: 'tool-msg-b',
    };
    registerArmedSubAgentBridge(regA);
    registerArmedSubAgentBridge(regB);
    const { get, store } = makeGet({
      dbMessagesMap: {
        'thread_agent-a_topic-1_thd_child_a': [{ content: 'answer a', role: 'assistant' }],
        'thread_agent-a_topic-1_thd_child_b': [{ content: 'answer b', role: 'assistant' }],
      },
    });

    await fireClientSubAgentBridge(get, childA);
    // First child: its message is backfilled, but the parent is NOT resumed.
    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-a',
      'answer a',
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store.executeClientAgent).not.toHaveBeenCalled();

    await fireClientSubAgentBridge(get, childB);
    // Last child: backfills its own message and resumes the parent once.
    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-b',
      'answer b',
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store.executeClientAgent).toHaveBeenCalledTimes(1);
    expect(store.executeClientAgent).toHaveBeenCalledWith(
      expect.objectContaining({ parentMessageId: 'tool-msg-b' }),
    );
  });

  // The bridge is the authoritative stats writer: the deferred placeholder
  // state must be replaced with terminal status + final totals, and the child
  // thread must be settled (the parked child skipped the normal path).
  it('persists terminal plugin state and settles the child thread', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdatePluginState).toHaveBeenCalledWith(
      'tool-msg-1',
      expect.objectContaining({ status: 'completed', totalToolCalls: expect.any(Number) }),
    );
  });

  // A failed continuation must reach the parent as a failure — not as the
  // last assistant text (potentially stale pre-failure content).
  it('failed child: parent receives an explicit failure, plugin state error', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext, {
      error: 'provider timeout',
      status: 'error',
    });

    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-1',
      expect.stringContaining('failed'),
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store.optimisticUpdatePluginState).toHaveBeenCalledWith(
      'tool-msg-1',
      expect.objectContaining({ status: 'error' }),
    );
  });

  it('interrupted child without error detail still reports as interrupted, not success', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext, { status: 'interrupted' });

    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-1',
      expect.stringContaining('interrupted'),
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store.optimisticUpdatePluginState).toHaveBeenCalledWith(
      'tool-msg-1',
      expect.objectContaining({ status: 'error' }),
    );
  });

  it('group-orchestration failed member: re-entry carries success=false', async () => {
    registerClientSubAgentBridge({ ...groupRegistration, armed: true });
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext, { error: 'boom', status: 'error' });

    expect(store.internal_execGroupOrchestration).toHaveBeenCalledWith(
      expect.objectContaining({
        initialResult: expect.objectContaining({
          payload: expect.objectContaining({ success: false }),
        }),
      }),
    );
  });

  // Round-4 fix: with parallel children, a mid-fire failure of child A must
  // restore BOTH its registry claim and its barrier slot. Otherwise sibling B
  // appears to be the last child, resumes the parent early, and A's later
  // retry is rejected by the non-running-parent guard before it backfills.
  it('barrier failure: slot restored, sibling cannot resume early, retry completes the barrier', async () => {
    const childA = { ...childContext, threadId: 'thd_child_a' } as any;
    const childB = { ...childContext, threadId: 'thd_child_b' } as any;
    const regA = { ...subAgentRegistration, childContext: childA, toolMessageId: 'tool-msg-a' };
    const regB = { ...subAgentRegistration, childContext: childB, toolMessageId: 'tool-msg-b' };
    registerArmedSubAgentBridge(regA);
    registerArmedSubAgentBridge(regB);
    let aBackfillAttempts = 0;
    const { get, store } = makeGet({
      dbMessagesMap: {
        'thread_agent-a_topic-1_thd_child_a': [{ content: 'answer a', role: 'assistant' }],
        'thread_agent-a_topic-1_thd_child_b': [{ content: 'answer b', role: 'assistant' }],
      },
      // A's backfill rejects on its first fire, succeeds on the retry.
      optimisticUpdateMessageContent: vi.fn().mockImplementation(async (id: string) => {
        if (id === 'tool-msg-a' && aBackfillAttempts++ === 0) throw new Error('db down');
        return undefined;
      }),
    });

    await fireClientSubAgentBridge(get, childA);
    // A failed: backfill rejected, parent NOT resumed, claim + slot restored.
    expect(store.executeClientAgent).not.toHaveBeenCalled();

    await fireClientSubAgentBridge(get, childB);
    // B succeeds but A's slot was RESTORED — B is NOT the last pending child,
    // so the parent must NOT resume early (this is the exact bug the fix
    // closes: the old finally-release let B resume while A was still pending).
    expect(store.executeClientAgent).not.toHaveBeenCalled();
    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-b',
      'answer b',
      undefined,
      { operationId: 'op_parent' },
    );

    // A's retry on a fresh terminal boundary (claim was restored, so the fire
    // finds it): backfill succeeds this time, A is the last pending child →
    // the barrier empties and the parent resumes exactly once.
    await fireClientSubAgentBridge(get, childA);
    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-a',
      'answer a',
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store.executeClientAgent).toHaveBeenCalledTimes(1);
    expect(store.executeClientAgent).toHaveBeenCalledWith(
      expect.objectContaining({ parentMessageId: 'tool-msg-a' }),
    );
  });

  // Round-4 fix: the outcome's cost/token split must land on the tool
  // message's plugin state — once flat totals exist the parent ledger stops
  // falling back to the live progress object, so a missing split reports zero
  // cost and loses the input/output breakdown.
  it('persists cost and token split from the outcome on the plugin state', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext, {
      cost: 0.42,
      status: 'done',
      usage: { input: 1100, output: 220, total: 1320 },
    });

    expect(store.optimisticUpdatePluginState).toHaveBeenCalledWith(
      'tool-msg-1',
      expect.objectContaining({
        status: 'completed',
        totalCost: 0.42,
        totalInputTokens: 1100,
        totalOutputTokens: 220,
        totalTokens: 1320,
      }),
    );
  });

  // Round-4 fix: the group re-entry must carry the supervisor snapshot so the
  // resumed loop continues from the pre-park decision point instead of
  // resetting to a fresh machine (replaying consumed decisions + restarting
  // the round budget).
  it('group re-entry carries the supervisor snapshot from registration', async () => {
    registerArmedSubAgentBridge({
      ...groupRegistration,
      supervisorSnapshot: { round: 3, skipCallSupervisor: true },
    });
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    expect(store.internal_execGroupOrchestration).toHaveBeenCalledWith(
      expect.objectContaining({
        initialResult: expect.objectContaining({
          payload: expect.objectContaining({
            supervisorSnapshot: { round: 3, skipCallSupervisor: true },
          }),
        }),
      }),
    );
  });

  // Round-4 fix: the spawner registers the FULL parent context — threadId /
  // scope / documentId must survive so the resume rebuilds the parent's
  // message bucket in the original scope, not the main-topic bucket.
  it('spawner registration preserves the full parent context', async () => {
    registerArmedSubAgentBridge({
      ...subAgentRegistration,
      parentContext: {
        agentId: 'agent-parent',
        documentId: 'doc-1',
        scope: 'page',
        workspaceSlug: 'team-x',
      } as any,
    });
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    // The resume re-created the agent state from the preserved context — the
    // page-scoped parent's message bucket key includes the documentId.
    const stateCall = store.internal_createAgentState.mock.calls[0]?.[0];
    expect(stateCall).toMatchObject({ agentId: 'agent-parent' });
    const startCall = store.startOperation.mock.calls[0]?.[0];
    expect(startCall.context).toMatchObject({ documentId: 'doc-1', workspaceSlug: 'team-x' });
  });

  // Round-5 fix: the resumed messages must be selected from the FULL parent
  // context bucket — a reduced { agentId, topicId, threadId } key collapsed
  // page- and group-scoped parents into the main bucket, so the resumed state
  // lost the parent history and the backfilled tool result.
  it('resume selects messages from the full parent-context bucket', async () => {
    registerArmedSubAgentBridge({
      ...subAgentRegistration,
      parentContext: {
        agentId: 'agent-parent',
        documentId: 'doc-1',
        scope: 'page',
      } as any,
    });
    const { get, store } = makeGet({
      dbMessagesMap: {
        // The page-scoped bucket the full context resolves to.
        'page_agent-parent_doc-1': [{ content: 'parent history', role: 'user' }],
      },
    });

    await fireClientSubAgentBridge(get, childContext);

    const createStateCall = store.internal_createAgentState.mock.calls[0]?.[0];
    expect(createStateCall.messages).toEqual([{ content: 'parent history', role: 'user' }]);
  });

  // Round-5 fix: the wrapper operation must be retired in BOTH cases — a
  // re-park leaves the runtime child operation running (the next bridge
  // retires it), but an orphaned wrapper kept the conversation marked busy
  // and sending permanently disabled.
  it('resume retires the wrapper operation even when the parent parks again', async () => {
    registerArmedSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet({
      executeClientAgent: vi.fn().mockResolvedValue({ parked: true }),
    });

    await fireClientSubAgentBridge(get, childContext);

    expect(store.completeOperation).toHaveBeenCalledWith('op_resume');
  });

  // Round-5 fix: the successful group path must release its barrier slot —
  // the caller deletes the registry claim, but the module-level
  // pendingByParentOp set stayed reachable and leaked per parked member.
  it('group success releases the barrier slot (no pendingByParentOp leak)', async () => {
    registerClientSubAgentBridge({ ...groupRegistration, armed: true });
    const { get } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    // The leak is observable through the retry path: a second fire for the
    // same parent op must NOT find a surviving slot (no way to assert the
    // private map directly, so assert via the barrier helper's effect — a
    // fresh registration for the same op then immediately resumes).
    const reg2 = {
      ...groupRegistration,
      childContext: { ...childContext, threadId: 'thd2' } as any,
      toolMessageId: 'tool-msg-2',
    };
    registerArmedSubAgentBridge(reg2);
    const { get: get2, store: store2 } = makeGet();
    await fireClientSubAgentBridge(get2, { ...childContext, threadId: 'thd2' } as any);
    // Single pending child on a fresh op → resumes immediately (no leftover
    // sibling slot from the earlier group fire).
    expect(store2.internal_execGroupOrchestration).toHaveBeenCalledTimes(1);
  });

  // ─── Round-6: two-phase activation ───

  // Round-6 P1 fix: the spawner registers BEFORE the parent's deferred pause
  // assembles (parallel tool lanes can still be running). A fire against an
  // unarmed registration must NOT resume the parent — the parent is still
  // executing and its deferred path would overwrite the resumed turn.
  it('unarmed registration: fire is held until the parent parks (arm)', async () => {
    registerClientSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    // No resume, no backfill: the claim and slot stay live for the retry.
    expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
    expect(store.executeClientAgent).not.toHaveBeenCalled();

    // The parent parks → arm scans the parent bucket for the deferred tool
    // row carrying the child threadId → the SAME fire now resumes.
    const { get: get2, store: store2 } = makeGet({
      dbMessagesMap: {
        'thread_agent-a_topic-1_thd_child': [
          { content: 'child final answer', role: 'user' },
          { content: 'child final answer', role: 'assistant' },
        ],
        // The parent's bucket with the deferred placeholder (the shape the
        // parked branch scans).
        'main_agent-parent_topic-1': [
          {
            id: 'tool-msg-1',
            pluginState: { status: 'running', threadId: 'thd_child' },
            role: 'tool',
          },
        ],
      },
    });
    armClientSubAgentBridgesForContext(get2, {
      agentId: 'agent-parent',
      topicId: 'topic-1',
    } as any);
    await fireClientSubAgentBridge(get2, childContext);
    expect(store2.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-1',
      'child final answer',
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store2.executeClientAgent).toHaveBeenCalledTimes(1);
  });

  // Round-6 P1 fix: arming only counts rows whose plugin state names THIS
  // child's thread — a parallel lane's callSubAgent that has not returned its
  // deferred result yet has no `running` row, so a later-registered sibling
  // still waits for its own park (the barrier cannot resume early).
  it('arm only activates registrations whose child thread matches a running deferred row', async () => {
    registerClientSubAgentBridge(subAgentRegistration);
    const { get, store } = makeGet({
      dbMessagesMap: {
        // The parent bucket has a running row for a DIFFERENT child thread.
        'main_agent-parent_topic-1': [
          {
            id: 'other-tool',
            pluginState: { status: 'running', threadId: 'thd_other' },
            role: 'tool',
          },
        ],
      },
    });

    armClientSubAgentBridgesForContext(get, { agentId: 'agent-parent', topicId: 'topic-1' } as any);
    await fireClientSubAgentBridge(get, childContext);

    // thd_child had no matching running row → never armed → still held.
    expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
  });

  // Round-6 P1 fix (group): the group park-exit registers AFTER the park is
  // fully formed, so its registration arms immediately and the fire goes
  // through unchanged.
  it('group registration is armed at registration time', async () => {
    registerGroupBridgeFromParkExit({
      childContext,
      childOperationId: 'op_child',
      memberAgentId: 'agent-a',
      messageContext: groupRegistration.messageContext as any,
      orchestrationOperationId: 'op_orch',
      supervisorAgentId: 'supervisor',
      toolMessageId: 'tool-msg-1',
    });
    const { get, store } = makeGet();

    await fireClientSubAgentBridge(get, childContext);

    expect(store.internal_execGroupOrchestration).toHaveBeenCalledTimes(1);
  });

  // ─── Round-6: post-reload reconstruction ───

  // Round-6 P1 fix: the module-level registry dies with the renderer, but a
  // parked child outlives a reload. A fire with no claim rebuilds the
  // registration from the persisted thread coordinates (armed) and settles
  // the parent.
  it('reloads: reconstructs the registration from persisted thread coordinates', async () => {
    const { threadService } = await import('@/services/thread');
    (threadService.getThreads as any).mockResolvedValue([
      {
        agentId: 'agent-child',
        id: 'thd_child',
        metadata: {
          bridge: {
            kind: 'sub-agent',
            parentContext: { agentId: 'agent-parent', topicId: 'topic-1' },
            parentOperationId: 'op_parent',
            toolMessageId: 'tool-msg-1',
          },
        },
        status: 'processing',
        topicId: 'topic-1',
      },
    ]);
    const { get, store } = makeGet({
      dbMessagesMap: {
        // The reconstructed child context derives its agentId from the thread
        // row ('agent-child'), so the child bucket key follows that.
        'thread_agent-child_topic-1_thd_child': [
          { content: 'child final answer', role: 'user' },
          { content: 'child final answer', role: 'assistant' },
        ],
        // Reload path: the parent op is gone — the durable park signal is the
        // deferred plugin state on the parent's tool row.
        'main_agent-parent_topic-1': [
          {
            id: 'tool-msg-1',
            pluginState: { status: 'running', threadId: 'thd_child' },
            role: 'tool',
          },
        ],
      },
      operations: {}, // reload: no in-memory operations
    });

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-1',
      'child final answer',
      undefined,
      { operationId: 'op_parent' },
    );
    expect(store.executeClientAgent).toHaveBeenCalledTimes(1);
  });

  // A settled thread (status flipped by the settle path) must NOT re-fire:
  // the persisted coordinates exist only for mid-run children.
  it('reload reconstruction skips a settled (non-processing) thread', async () => {
    const { threadService } = await import('@/services/thread');
    (threadService.getThreads as any).mockResolvedValue([
      {
        id: 'thd_child',
        metadata: {
          bridge: { kind: 'sub-agent', toolMessageId: 'tool-msg-1' },
        },
        status: 'completed',
        topicId: 'topic-1',
      },
    ]);
    const { get, store } = makeGet({ operations: {} });

    await fireClientSubAgentBridge(get, childContext);

    expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
    expect(store.executeClientAgent).not.toHaveBeenCalled();
  });

  // Registration persists the coordinates as the post-reload lifeline.
  it('registration persists bridge coordinates to the child thread metadata', async () => {
    const { threadService } = await import('@/services/thread');
    (threadService.getThreads as any).mockResolvedValue([
      { id: 'thd_child', metadata: { clientMode: true, startedAt: 't' }, status: 'processing' },
    ]);

    registerArmedSubAgentBridge(subAgentRegistration);
    // Fire-and-forget persistence — flush the microtask chain.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(threadService.updateThread).toHaveBeenCalledWith(
      'thd_child',
      expect.objectContaining({
        metadata: expect.objectContaining({
          bridge: expect.objectContaining({
            kind: 'sub-agent',
            toolMessageId: 'tool-msg-1',
          }),
          clientMode: true,
          startedAt: 't',
        }),
      }),
    );
  });
});
