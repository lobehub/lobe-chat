// @vitest-environment node
import { ThreadStatus } from '@lobechat/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompletionLifecycle } from '../CompletionLifecycle';

const { mockSettleIsolationRun } = vi.hoisted(() => ({
  mockSettleIsolationRun: vi.fn(async () => true),
}));

// `settleIsolationRun` is a class FIELD, so observing it means swapping the class.
vi.mock('@/database/models/thread', () => ({
  ThreadModel: vi.fn(function () {
    return { settleIsolationRun: mockSettleIsolationRun };
  }),
}));

vi.mock('@/database/models/topic', () => ({
  TopicModel: vi.fn(function () {
    return { settleRunningOperation: vi.fn(async () => ({ status: 'settled' })) };
  }),
}));

vi.mock('@/database/models/work', () => ({
  WorkModel: vi.fn(function () {
    return { listByRootOperation: vi.fn(async () => []) };
  }),
}));

vi.mock('@/business/server/agent-run/agentInterventionReview', () => ({
  notifyAgentInterventionRequired: vi.fn(async () => {}),
}));

vi.mock('@/business/server/agent-run/notifyAgentRunCompleted', () => ({
  notifyAgentRunCompleted: vi.fn(async () => {}),
}));

vi.mock('@/server/services/workRegistration', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  registerWorksForOperation: vi.fn(),
}));

/**
 * In queue mode the in-memory thread hooks of `execAgentThreadRun` never fire,
 * so the operation's own terminal persist is what moves a `callAgent` /
 * `callSubAgent` isolation thread out of `processing`.
 */
describe('CompletionLifecycle.dispatchHooks — the isolation thread', () => {
  const operationModel = (recordCompletion: () => Promise<boolean> = async () => true) => ({
    findById: vi.fn(async () => null),
    recordCompletion: vi.fn(recordCompletion),
    sumChildUsage: vi.fn(async () => undefined),
  });

  const buildLifecycle = (model = operationModel()) => {
    const lifecycle = new CompletionLifecycle({} as any, 'user-1', 'ws-1');
    (lifecycle as any).agentOperationModel = model;
    return lifecycle;
  };

  const state = (overrides: Record<string, unknown> = {}) => ({
    host: { hooks: [] },
    messages: [{ content: 'final reply', role: 'assistant' }],
    origin: {
      agentId: 'agt_1',
      lineage: { isSubAgent: true },
      threadId: 'thd_1',
      topicId: 'tpc_1',
    },
    status: 'done',
    ...overrides,
  });

  beforeEach(() => {
    mockSettleIsolationRun.mockReset().mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes the thread when the sub-agent run finishes', async () => {
    await buildLifecycle().dispatchHooks('op-1', state(), 'done');

    expect(mockSettleIsolationRun).toHaveBeenCalledWith('thd_1', 'op-1', {
      error: undefined,
      status: ThreadStatus.Completed,
    });
  });

  it('fails the thread with the run error', async () => {
    await buildLifecycle().dispatchHooks(
      'op-1',
      state({ error: { message: 'provider down', type: 'ProviderBizError' }, status: 'error' }),
      'error',
      { skipErrorMessageWrite: true },
    );

    expect(mockSettleIsolationRun).toHaveBeenCalledWith('thd_1', 'op-1', {
      error: expect.objectContaining({ message: 'provider down' }),
      status: ThreadStatus.Failed,
    });
  });

  it('cancels the thread when the run is interrupted', async () => {
    await buildLifecycle().dispatchHooks('op-1', state({ status: 'interrupted' }), 'interrupted');

    expect(mockSettleIsolationRun).toHaveBeenCalledWith(
      'thd_1',
      'op-1',
      expect.objectContaining({ status: ThreadStatus.Cancel }),
    );
  });

  it.each(['waiting_for_async_tool', 'waiting_for_client', 'waiting_for_human'])(
    'leaves the thread while the run is parked in %s',
    async (reason) => {
      await buildLifecycle().dispatchHooks('op-1', state({ status: reason }), reason);

      expect(mockSettleIsolationRun).not.toHaveBeenCalled();
    },
  );

  it('does nothing for a run outside a thread', async () => {
    await buildLifecycle().dispatchHooks(
      'op-1',
      state({ origin: { agentId: 'agt_1', topicId: 'tpc_1' } }),
      'done',
    );

    expect(mockSettleIsolationRun).not.toHaveBeenCalled();
  });

  it('leaves the thread when the terminal row could not be written', async () => {
    await buildLifecycle(
      operationModel(async () => {
        throw new Error('db down');
      }),
    ).dispatchHooks('op-1', state(), 'done');

    expect(mockSettleIsolationRun).not.toHaveBeenCalled();
  });

  it('does not fail the completion when the thread write fails', async () => {
    mockSettleIsolationRun.mockRejectedValue(new Error('db down'));

    await expect(buildLifecycle().dispatchHooks('op-1', state(), 'done')).resolves.not.toThrow();
  });
});
