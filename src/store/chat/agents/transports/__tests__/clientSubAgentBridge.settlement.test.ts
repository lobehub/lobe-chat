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
  // the child thread still `processing`, and the automatic retry (P1
  // round-10) settles it once the outage recovers. The retry is driven
  // purely by the scheduled timer: the child's terminal boundary was the only
  // production caller, so no second manual fire is available in production.
  it('settlement persistent failure: restores claim, scheduled retry settles after recovery', async () => {
    vi.useFakeTimers();
    try {
      registerArmedSubAgentBridge(subAgentRegistration);
      const { get, store } = makeGet();
      const { aiAgentService } = await import('@/services/aiAgent');
      (aiAgentService.updateClientTaskThreadStatus as any).mockRejectedValue(
        new Error('server down'),
      );

      // fireClientSubAgentBridge must still resolve — a bridge failure must
      // not fail the child run boundary. Advance only through the in-fire
      // settle backoffs (1s + 2s): the scheduled automatic retry at +5s must
      // NOT run yet, so the recovery below lands within the retry budget.
      const fire = fireClientSubAgentBridge(get, childContext);
      await vi.advanceTimersByTimeAsync(3000);
      await fire;

      expect(aiAgentService.updateClientTaskThreadStatus).toHaveBeenCalledTimes(3);
      // The fire aborted before the parent path: no backfill, no resume.
      expect(store.optimisticUpdateMessageContent).not.toHaveBeenCalled();
      expect(store.executeClientAgent).not.toHaveBeenCalled();

      // The outage recovers BEFORE the next scheduled automatic retry: the
      // timer — not a manual re-fire — drives the settlement and resume.
      (aiAgentService.updateClientTaskThreadStatus as any).mockResolvedValue(undefined);
      await vi.advanceTimersByTimeAsync(5000);

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

  // P1 (round-10): the automatic retry must be bounded — once the budget is
  // exhausted the claim + persisted coordinates remain for the reload
  // reconstruction, and no further timers are scheduled.
  it('scheduled retry budget exhausted: stops re-firing, claim stays for reload reconstruction', async () => {
    vi.useFakeTimers();
    try {
      registerArmedSubAgentBridge(subAgentRegistration);
      const { get, store } = makeGet();
      const { aiAgentService } = await import('@/services/aiAgent');
      (aiAgentService.updateClientTaskThreadStatus as any).mockRejectedValue(
        new Error('server down'),
      );

      const fire = fireClientSubAgentBridge(get, childContext);
      await vi.runAllTimersAsync();
      await fire;

      // 5 fires total (initial + 4 scheduled automatic retries) × 3 settle
      // attempts each = 15 calls, then no more: the budget cap stops any
      // further scheduling after retry 4 fails.
      expect(aiAgentService.updateClientTaskThreadStatus.mock.calls.length).toBe(15);
      // Still no parent settlement — the outage never recovered.
      expect(store.executeClientAgent).not.toHaveBeenCalled();

      // Exhausting the budget keeps the claim; a later manual re-fire (the
      // reload-reconstruction equivalent) settles the thread and resumes.
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
