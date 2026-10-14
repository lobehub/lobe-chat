import { describe, expect, it, vi } from 'vitest';

import { fireClientSubAgentBridge, registerClientSubAgentBridge } from '../clientSubAgentBridge';

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
    internal_execGroupOrchestration: vi.fn().mockResolvedValue(undefined),
    internal_resumeClientSubAgentParent: vi.fn().mockResolvedValue(undefined),
    operations: {
      op_child: { status: 'running' },
      op_parent: { status: 'running' },
      op_orch: { status: 'running' },
    },
    optimisticUpdateMessageContent: vi.fn().mockResolvedValue(undefined),
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
    expect(store.internal_resumeClientSubAgentParent).toHaveBeenCalledWith({
      context: subAgentRegistration.parentContext,
      parentMessageId: 'tool-msg-1',
    });
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
    expect(store.internal_resumeClientSubAgentParent).not.toHaveBeenCalled();
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
});
