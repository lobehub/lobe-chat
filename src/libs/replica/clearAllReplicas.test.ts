import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';

import { LocalStorageQueryProjectionStorage } from '@/libs/queryProjectionStorage';

import {
  cacheScope,
  clearAllReplicas,
  createReplicaSlice,
  createReplicaState,
  defineReplica,
  recordLens,
  type ReplicaState,
  replicaSWRDriver,
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
    const namespace = 'replica:clearAllReplicasLazyTest:v1';
    const key = { queryKey: 'a', scope: cacheScope.get() };
    await new LocalStorageQueryProjectionStorage<string>({ namespace }).set(key, {
      data: 'previous server',
      updatedAt: 1,
    });

    clearAllReplicas();
    const lazy = defineReplica<string, string>({
      key: (id) => id,
      name: 'clearAllReplicasLazyTest',
      storage: 'localStorage',
      version: 1,
    });

    expect(await lazy.storage!.get(key)).toBeUndefined();
  });

  it('purges rows an earlier session persisted that this session never loaded', async () => {
    const rows = new Map<string, { data: unknown; updatedAt: number }>([
      ['__replica:index', { data: ['old'], updatedAt: 1 }],
      ['old', { data: 'previous server', updatedAt: 1 }],
    ]);
    const persisted = defineReplica<string, string>({
      key: (id) => id,
      name: 'clearAllReplicasPurgeTest',
      storage: {
        get: async ({ queryKey }) => rows.get(queryKey) as never,
        getStrict: async ({ queryKey }) => rows.get(queryKey) as never,
        remove: async ({ queryKey }) => void rows.delete(queryKey),
        set: async ({ queryKey }, row) => void rows.set(queryKey, row),
      },
      version: 1,
    });
    const store = createStore<TestState>(() => ({
      itemMap: {},
      itemReplica: createReplicaState(),
    }));
    createReplicaSlice(persisted, {
      actionPrefix: 'clearAllReplicasPurgeTest',
      get: store.getState,
      set: store.setState,
      stateKey: 'itemReplica',
      view: recordLens<TestState, string>('itemMap'),
    });
    const canPersist = vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);

    clearAllReplicas();
    await vi.waitFor(() => expect(rows.has('old')).toBe(false));

    canPersist.mockRestore();
  });

  it('revalidates replica read keys, custom sync keys included, and nothing else', () => {
    // Keys a replica read went through the driver with.
    const fetcher = async () => undefined;
    replicaSWRDriver.useQuery(
      ['replica:sync', 'clearAllReplicasTest', 'q', 'scope', 'a'],
      fetcher,
      {},
    );
    replicaSWRDriver.useQuery(['userMemory', 'contexts', { page: 1 }], fetcher, {});
    swrMutate.mockClear();

    clearAllReplicas();

    const [match] = swrMutate.mock.calls.at(-1) as unknown as [(key: unknown) => boolean];
    expect(match(['replica:sync', 'clearAllReplicasTest', 'q', 'scope', 'a'])).toBe(true);
    expect(match(['userMemory', 'contexts', { page: 1 }])).toBe(true);
    // With an active workspace `useClientDataSWR` caches them under `augmentKey`.
    expect(match(['replica:sync', 'clearAllReplicasTest', 'q', 'scope', 'a', 'ws-1'])).toBe(true);
    expect(match(['userMemory', 'contexts', { page: 1 }, 'ws-1'])).toBe(true);
    // An imperative action SWR (e.g. "create topic") must never fire on its own.
    expect(match('openNewTopicOrSaveTopic')).toBe(false);
    expect(match(['openNewTopicOrSaveTopic', 'ws-1'])).toBe(false);
  });
});
