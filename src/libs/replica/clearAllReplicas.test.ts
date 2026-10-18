import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';

import {
  cacheScope,
  clearAllReplicas,
  createReplicaSlice,
  createReplicaState,
  defineReplica,
  recordLens,
  type ReplicaState,
} from './index';

const swrMutate = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock('@/libs/swr', () => ({ mutate: swrMutate, useClientDataSWR: vi.fn() }));

interface TestState {
  itemMap: Record<string, string>;
  itemReplica: ReplicaState<string>;
}

const resource = defineReplica<string, string>({
  key: (id) => id,
  name: 'clearAllReplicasTest',
  version: 1,
});

describe('clearAllReplicas', () => {
  it('discards a read still in flight from the previous data context', async () => {
    const store = createStore<TestState>(() => ({
      itemMap: {},
      itemReplica: createReplicaState(),
    }));
    let answer!: (value: string) => void;
    const slice = createReplicaSlice(resource, {
      actionPrefix: 'clearAllReplicasTest',
      fetcher: () =>
        new Promise<string>((resolve) => {
          answer = resolve;
        }),
      get: store.getState,
      set: store.setState,
      stateKey: 'itemReplica',
      view: recordLens<TestState, string>('itemMap'),
    });

    const pending = slice.fetch('a');
    // A Desktop server switch (`stores.reset()`) lands while the read is out.
    clearAllReplicas();
    answer('previous server');
    await pending.catch(() => undefined);

    expect(store.getState().itemMap.a).toBeUndefined();
  });

  it('retires the persisted rows of a replica built only after the reset', async () => {
    // A lazy route's resource: no slice existed when `stores.reset()` ran.
    const rows = new Map([['a', { data: 'previous server', updatedAt: Date.now() - 1000 }]]);
    clearAllReplicas();
    const lazy = defineReplica<string, string>({
      key: (id) => id,
      name: 'clearAllReplicasLazyTest',
      storage: {
        get: async ({ queryKey }) => rows.get(queryKey),
        getStrict: async ({ queryKey }) => rows.get(queryKey),
        remove: async ({ queryKey }) => void rows.delete(queryKey),
        set: async ({ queryKey }, row) => void rows.set(queryKey, row),
      },
      version: 1,
    });

    expect(await lazy.storage!.get({ queryKey: 'a', scope: cacheScope.get() })).toBeUndefined();
  });

  it('revalidates the mounted replica syncs so the new context repaints', () => {
    swrMutate.mockClear();

    clearAllReplicas();

    const [match] = swrMutate.mock.calls.at(-1) as unknown as [(key: unknown) => boolean];
    expect(match(['replica:sync', 'clearAllReplicasTest', 'q', 'scope', 'a'])).toBe(true);
    expect(match(['agent', 'list'])).toBe(false);
  });
});
