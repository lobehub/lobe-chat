// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompletionLifecycle } from '@/server/services/agentRuntime/CompletionLifecycle';

import { HeterogeneousAgentService } from '..';

const { startQueuedFollowUp } = vi.hoisted(() => ({ startQueuedFollowUp: vi.fn() }));
vi.mock('@/server/services/aiAgent', () => ({
  AiAgentService: vi.fn().mockImplementation(function () {
    return { startQueuedFollowUp };
  }),
}));

const createService = (operation: Record<string, unknown> | null) => {
  const order: string[] = [];
  vi.spyOn(CompletionLifecycle.prototype, 'completeOperation').mockImplementation(async () => {
    order.push('complete');
  });
  startQueuedFollowUp.mockImplementation(async () => {
    order.push('followUp');
  });

  const service = new HeterogeneousAgentService({} as any, 'user-1', {
    agentOperationModel: { findById: vi.fn(async () => operation) } as any,
    persistenceHandler: { finish: vi.fn(async () => undefined) } as any,
    snapshotStore: null,
    streamEventManager: { publishStreamEvent: vi.fn(async () => 'ok') } as any,
    topicModel: {
      settleRunningOperation: vi.fn(async () => ({ status: 'settled' })),
      updateMetadata: vi.fn(async () => undefined),
    } as any,
    workspaceId: 'ws-1',
  });
  return { order, service };
};

const finish = (service: HeterogeneousAgentService, result: 'cancelled' | 'error' | 'success') =>
  service.heteroFinish({
    agentType: 'claude-code',
    operationId: 'op-1',
    result,
    topicId: 'tpc-1',
  });

describe('HeterogeneousAgentService.heteroFinish — queued follow-ups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts the follow-ups queued behind a finished run once its completion settled', async () => {
    const { order, service } = createService({ metadata: {}, threadId: 'thd-1' });

    await finish(service, 'success');

    expect(startQueuedFollowUp).toHaveBeenCalledWith({
      operationId: 'op-1',
      scope: { threadId: 'thd-1', topicId: 'tpc-1', userId: 'user-1' },
    });
    expect(order).toEqual(['complete', 'followUp']);
  });

  it.each(['error', 'cancelled'] as const)('leaves the queue alone on %s', async (result) => {
    const { service } = createService({ metadata: {} });

    await finish(service, result);

    expect(startQueuedFollowUp).not.toHaveBeenCalled();
  });

  it('leaves the parent conversation queue to the parent run', async () => {
    const { service } = createService({ metadata: {}, parentOperationId: 'op-0' });

    await finish(service, 'success');

    expect(startQueuedFollowUp).not.toHaveBeenCalled();
  });

  it('keeps the finish acknowledged when the follow-up cannot start', async () => {
    const { service } = createService({ metadata: {} });
    startQueuedFollowUp.mockRejectedValue(new Error('boom'));

    await expect(finish(service, 'success')).resolves.toBeUndefined();
  });
});
