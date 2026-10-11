import { describe, expect, it, vi } from 'vitest';

import type { ReplicaStorage } from './types';
import { ReplicaWriteQueue } from './writeQueue';

describe('ReplicaWriteQueue', () => {
  it('serializes writes for the same projection key', async () => {
    let releaseFirst!: () => void;
    const first = new Promise<void>((resolve) => (releaseFirst = resolve));
    const calls: number[] = [];
    const storage: ReplicaStorage<number> = {
      get: vi.fn(),
      remove: vi.fn(),
      set: vi.fn(async (_key, projection) => {
        calls.push(projection.data);
        if (projection.data === 1) await first;
      }),
    };
    const queue = new ReplicaWriteQueue(storage);
    const key = { queryKey: 'list', scope: 'scope' };

    queue.set(key, { data: 1, updatedAt: 1 });
    queue.set(key, { data: 2, updatedAt: 2 });
    await vi.waitFor(() => expect(calls).toEqual([1]));

    releaseFirst();
    await vi.waitFor(() => expect(calls).toEqual([1, 2]));
  });

  it('runs a barrier after the queued writes, and later writes behind it', async () => {
    const order: string[] = [];
    let releaseWrite!: () => void;
    const held = new Promise<void>((resolve) => (releaseWrite = resolve));
    const storage: ReplicaStorage<number> = {
      get: vi.fn(),
      purgeScopePrefix: vi.fn(async () => {
        order.push('purge');
      }),
      remove: vi.fn(),
      set: vi.fn(async (_key, projection) => {
        order.push(`set:${projection.data}`);
        if (projection.data === 1) await held;
      }),
    };
    const queue = new ReplicaWriteQueue(storage);
    const key = { queryKey: 'list', scope: 'scope' };

    queue.set(key, { data: 1, updatedAt: 1 });
    const purged = queue.barrier(() => storage.purgeScopePrefix!('scope:'));

    // The barrier waits for the write that is already queued…
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(order).toEqual(['set:1']);

    // …and a write queued while it is pending runs after it, not across it.
    const later = queue.set(key, { data: 2, updatedAt: 2 });
    releaseWrite();
    await purged;
    await later;

    expect(order).toEqual(['set:1', 'purge', 'set:2']);
  });

  it('update reads after earlier queued writes and never recreates a removed row', async () => {
    const rows = new Map<string, { data: number; updatedAt: number }>();
    const storage: ReplicaStorage<number> = {
      get: async ({ queryKey }) => rows.get(queryKey),
      remove: async ({ queryKey }) => {
        rows.delete(queryKey);
      },
      set: async ({ queryKey }, projection) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        rows.set(queryKey, projection);
      },
    };
    const queue = new ReplicaWriteQueue(storage);
    const key = { queryKey: 'list', scope: 'scope' };
    const increment = (current?: { data: number }) =>
      current ? { data: current.data + 1, updatedAt: 2 } : undefined;

    queue.set(key, { data: 1, updatedAt: 1 });
    queue.update(key, increment);
    await vi.waitFor(() => expect(rows.get('list')?.data).toBe(2));

    queue.remove(key);
    queue.update(key, increment);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(rows.has('list')).toBe(false);
  });

  it('reports whether a queued write actually landed', async () => {
    let fail = false;
    const storage: ReplicaStorage<number> = {
      get: vi.fn(),
      remove: vi.fn(async () => {
        if (fail) throw new Error('IndexedDB delete failed');
      }),
      set: vi.fn(async () => {}),
    };
    const queue = new ReplicaWriteQueue(storage);
    const key = { queryKey: 'list', scope: 'scope' };

    await expect(queue.remove(key)).resolves.toBe(true);

    fail = true;
    // A rejected delete resolves `false` instead of rejecting: the caller must be
    // able to keep the removal retryable, and one bad write must not poison the
    // chain for later writers on the same key.
    await expect(queue.remove(key)).resolves.toBe(false);
    await expect(queue.set(key, { data: 1, updatedAt: 1 })).resolves.toBe(true);
  });
});
