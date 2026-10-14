import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetBridgeForTests, fireClientSubAgentBridge } from '../clientSubAgentBridge';
import {
  childContext,
  makeGet,
  registerArmedSubAgentBridge,
  subAgentRegistration,
} from './testUtils';

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

beforeEach(() => {
  // The registry is module-level; a restored claim (retry semantics) from one
  // case must never leak into the next.
  __resetBridgeForTests();
});

describe('clientSubAgentBridge settlement', () => {
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

  // P2 (round-9): a transiently failing settlement must be retried within
  // bounds — the fire continues to the parent resume once it succeeds.
  it('settlement transient failure: retries within bounds and completes the fire', async () => {
    vi.useFakeTimers();
    try {
      registerArmedSubAgentBridge(subAgentRegistration);
      const { get, store } = makeGet();
      const { aiAgentService } = await import('@/services/aiAgent');
      (aiAgentService.updateClientTaskThreadStatus as any)
        .mockRejectedValueOnce(new Error('network blip'))
        .mockRejectedValueOnce(new Error('network blip'))
        .mockResolvedValueOnce(undefined);

      const fire = fireClientSubAgentBridge(get, childContext);
      await vi.runAllTimersAsync();
      await fire;

      expect(aiAgentService.updateClientTaskThreadStatus).toHaveBeenCalledTimes(3);
      expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        'tool-msg-1',
        'child final answer',
        undefined,
        { operationId: 'op_parent' },
      );
      expect(store.executeClientAgent).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  // P2 (round-9): a persistently failing settlement must abort the fire and
  // restore the claim + barrier slot — the parent must NOT be resumed with
  // the child thread still `processing`, and a later re-fire settles it.
  it('settlement persistent failure: restores claim + barrier slot, parent not resumed', async () => {
    vi.useFakeTimers();
    try {
      registerArmedSubAgentBridge(subAgentRegistration);
      const { get, store } = makeGet();
      const { aiAgentService } = await import('@/services/aiAgent');
      (aiAgentService.updateClientTaskThreadStatus as any).mockRejectedValue(
        new Error('server down'),
      );

      // fireClientSubAgentBridge must still resolve — a bridge failure must
      // not fail the child run boundary.
      const fire = fireClientSubAgentBridge(get, childContext);
      await vi.runAllTimersAsync();
      await fire;

      expect(aiAgentService.updateClientTaskThreadStatus).toHaveBeenCalledTimes(3);
      // The fire aborted before the parent path: no backfill, no resume.
      expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
      expect(store.executeClientAgent).not.toHaveBeenCalled();

      // The outage recovers: a re-fire settles the thread and resumes the parent.
      (aiAgentService.updateClientTaskThreadStatus as any).mockResolvedValue(undefined);
      await fireClientSubAgentBridge(get, childContext);
      expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        'tool-msg-1',
        'child final answer',
        undefined,
        { operationId: 'op_parent' },
      );
      expect(store.executeClientAgent).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
