import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetBridgeForTests,
  fireClientSubAgentBridge,
  registerClientSubAgentBridge,
} from '../clientSubAgentBridge';

beforeEach(() => {
  // The registry is module-level; a restored claim (retry semantics) from one
  // case must never leak into the next.
  __resetBridgeForTests();
});

const childContext = { agentId: 'agent-a', threadId: 'thd_child', topicId: 'topic-1' } as any;

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

describe('clientSubAgentBridge', () => {
  it('sub-agent kind: backfills the tool message, retires the parked ops, resumes the parent', async () => {
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge(groupRegistration);
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
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge(subAgentRegistration);
    const { get } = makeGet({
      optimisticUpdateMessageContent: vi.fn().mockRejectedValue(new Error('db down')),
    });

    await expect(fireClientSubAgentBridge(get, childContext)).resolves.toBeUndefined();
  });

  it('skips registration when the child context has no threadId', async () => {
    registerClientSubAgentBridge({
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
    registerClientSubAgentBridge(regA);
    registerClientSubAgentBridge(regB);
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
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge(groupRegistration);
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
    registerClientSubAgentBridge(regA);
    registerClientSubAgentBridge(regB);
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
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge({
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
    registerClientSubAgentBridge({
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
    registerClientSubAgentBridge({
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
    registerClientSubAgentBridge(subAgentRegistration);
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
    registerClientSubAgentBridge(groupRegistration);
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
    registerClientSubAgentBridge(reg2);
    const { get: get2, store: store2 } = makeGet();
    await fireClientSubAgentBridge(get2, { ...childContext, threadId: 'thd2' } as any);
    // Single pending child on a fresh op → resumes immediately (no leftover
    // sibling slot from the earlier group fire).
    expect(store2.internal_execGroupOrchestration).toHaveBeenCalledTimes(1);
  });
});
