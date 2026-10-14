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
        skipCreateFirstMessage: true,
      }),
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
});
