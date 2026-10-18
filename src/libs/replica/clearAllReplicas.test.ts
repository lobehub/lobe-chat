import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';

import {
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

  it('revalidates the mounted replica syncs so the new context repaints', () => {
    swrMutate.mockClear();

    clearAllReplicas();

    const [match] = swrMutate.mock.calls.at(-1) as unknown as [(key: unknown) => boolean];
    expect(match(['replica:sync', 'clearAllReplicasTest', 'q', 'scope', 'a'])).toBe(true);
    expect(match(['agent', 'list'])).toBe(false);
  });
});
