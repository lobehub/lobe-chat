import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __clearRegistryForTests,
  __resetBridgeForTests,
  fireClientSubAgentBridge,
  flushPendingBridgeCoordinates,
  registerClientSubAgentBridge,
} from '../clientSubAgentBridge';
import { childContext, makeGet, subAgentRegistration } from './testUtils';

vi.mock('@/services/aiAgent', () => ({
  aiAgentService: {
    updateClientTaskThreadStatus: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/thread', () => ({
  threadService: {
    getThreads: vi.fn().mockResolvedValue([]),
    mergeThreadMetadata: vi.fn().mockResolvedValue(true),
    updateThread: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/message', () => ({
  messageService: {
    getMessages: vi.fn().mockResolvedValue([]),
  },
}));

const PERSIST_QUEUE_KEY = 'LOBE_CLIENT_SUB_AGENT_BRIDGE_PERSIST_QUEUE';

const readQueue = (): any[] => {
  const raw = localStorage.getItem(PERSIST_QUEUE_KEY);
  return raw ? (JSON.parse(raw) as any[]) : [];
};

const { threadService } = await import('@/services/thread');

beforeEach(() => {
  // The registry is module-level; a restored claim (retry semantics) from one
  // case must never leak into the next.
  __resetBridgeForTests();
  (threadService.getThreads as any).mockReset();
  (threadService.getThreads as any).mockResolvedValue([]);
  (threadService.mergeThreadMetadata as any).mockReset();
  (threadService.mergeThreadMetadata as any).mockResolvedValue(true);
  (threadService.updateThread as any).mockReset();
  (threadService.updateThread as any).mockResolvedValue(undefined);
});

/**
 * P1 (round-21): the coordinate write is no longer a bare fire-and-forget.
 * `metadata.bridge` is the only durable coordinate source for the
 * post-reload reconstruction, so a transient failure (or an in-flight write
 * cancelled by a reload) must not lose the coordinates: they are enqueued
 * write-ahead into a durable localStorage queue and flushed by a retry
 * driver — which reconstruction drains BEFORE reading the thread rows.
 */
describe('clientSubAgentBridge persist queue (round-21)', () => {
  it('successful persistence drains the queue entry', async () => {
    registerClientSubAgentBridge(subAgentRegistration);
    // Let the fire-and-forget persistence resolve.
    await vi.waitFor(() => expect(readQueue()).toHaveLength(0));
    expect(threadService.mergeThreadMetadata).toHaveBeenCalledWith('thd_child', {
      bridge: expect.objectContaining({ kind: 'sub-agent', toolMessageId: 'tool-msg-1' }),
    });
  });

  it('a transient failure keeps the entry queued and flushes it later', async () => {
    (threadService.mergeThreadMetadata as any)
      .mockRejectedValueOnce(new Error('transient network failure'))
      .mockResolvedValueOnce(true);

    registerClientSubAgentBridge(subAgentRegistration);

    // The first (failing) write leaves the entry queued — the coordinates
    // survive even though the request failed.
    await vi.waitFor(() => expect(readQueue()).toHaveLength(1));
    expect(readQueue()[0]).toMatchObject({ childThreadId: 'thd_child' });

    // The flush driver drains it on the next attempt.
    await flushPendingBridgeCoordinates();
    expect(threadService.mergeThreadMetadata).toHaveBeenCalledTimes(2);
    expect(readQueue()).toHaveLength(0);
  });

  it('reconstruction drains the queue BEFORE reading the thread rows (persist-failed-then-reload)', async () => {
    (threadService.mergeThreadMetadata as any)
      // The original registration write fails (transient).
      .mockRejectedValueOnce(new Error('transient network failure'))
      // The flush during reconstruction succeeds.
      .mockResolvedValueOnce(true);

    registerClientSubAgentBridge(subAgentRegistration);
    await vi.waitFor(() => expect(readQueue()).toHaveLength(1));

    // Simulate the reload: the in-memory registry dies while the durable
    // persist queue survives (localStorage).
    __clearRegistryForTests();

    // Simulate the reload: a fire with an empty registry. The row read
    // happens AFTER the flush, and the flush re-wrote the coordinates.
    const callOrder: string[] = [];
    (threadService.mergeThreadMetadata as any).mockImplementation(async () => {
      callOrder.push('merge');
      return true;
    });
    (threadService.getThreads as any).mockImplementation(async () => {
      callOrder.push('getThreads');
      return [
        {
          agentId: 'agent-child',
          id: 'thd_child',
          metadata: {
            // Coordinates persisted by the flush, not by the failed original
            // write — this row is what reconstruction must find.
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
      ];
    });

    const { get, store } = makeGet({
      dbMessagesMap: {
        'thread_agent-child_topic-1_thd_child': [
          { content: 'child final answer', role: 'user' },
          { content: 'child final answer', role: 'assistant' },
        ],
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

    // The flush landed before the row read: reconstruction saw the
    // re-written coordinates and the parent resumed.
    expect(callOrder.indexOf('merge')).toBeLessThan(callOrder.indexOf('getThreads'));
    expect(store.optimisticUpdateMessageContent).toHaveBeenCalledWith(
      'tool-msg-1',
      'child final answer',
      undefined,
      { operationId: 'op_parent' },
    );
    expect(readQueue()).toHaveLength(0);
  });

  it('a settled or gone thread drains the queued entry without retrying forever', async () => {
    (threadService.mergeThreadMetadata as any)
      .mockRejectedValueOnce(new Error('transient network failure'))
      // The `processing` guard rejects the re-write: the thread settled or
      // was deleted while the entry sat in the queue.
      .mockResolvedValueOnce(false)
      .mockResolvedValue(false);

    registerClientSubAgentBridge(subAgentRegistration);
    await vi.waitFor(() => expect(readQueue()).toHaveLength(1));

    await flushPendingBridgeCoordinates();
    // Rejected = stale coordinates, correctly NOT resurrected on a settled
    // row — the entry is drained, not retried.
    expect(readQueue()).toHaveLength(0);

    // And a second flush is a no-op (no immortal timer loop).
    await flushPendingBridgeCoordinates();
    expect(threadService.mergeThreadMetadata).toHaveBeenCalledTimes(2);
  });
});
