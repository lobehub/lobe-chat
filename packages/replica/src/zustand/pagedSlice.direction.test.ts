import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';

import { testDriver as driver } from '../../tests/testDriver';
import { definePagedReplica } from '../core/defineReplica';
import type { ReplicaPagedData, ReplicaPageResult } from '../core/paging';
import { createReplicaState } from '../core/reducer';
import type { ReplicaScope, ReplicaState } from '../core/types';
import { createReplicaSlice, recordLens } from './createReplicaSlice';

interface Row {
  id: string;
}
interface Params {
  forward: boolean;
  topic: string;
}
type Paged = ReplicaPagedData<Row, string>;
interface TestState {
  rows: Record<string, Paged>;
  rowsReplica: ReplicaState<Paged>;
}

const scope: ReplicaScope = { canPersist: () => false, get: () => 'user-1', use: () => 'user-1' };

const page = (items: string[], nextCursor: string | null): ReplicaPageResult<Row, string> => ({
  items: items.map((id) => ({ id })),
  nextCursor,
});

const setup = () => {
  const fetchPage = vi.fn(async ({ forward }: Params, cursor?: string) =>
    forward
      ? cursor === 'after-b'
        ? page(['c', 'd'], null)
        : page(['a', 'b'], 'after-b')
      : cursor === 'before-c'
        ? page(['a', 'b'], null)
        : page(['c', 'd'], 'before-c'),
  );
  const resource = definePagedReplica<Params, Row, string>({
    fetchPage,
    key: ({ forward, topic }) => `${forward ? 'f' : 'b'}:${topic}`,
    name: 'directionTest',
    paging: {
      direction: 'backward',
      directionOf: (key) => (key.startsWith('f:') ? 'forward' : 'backward'),
      getId: (item) => item.id,
      mode: 'cursor',
    },
    scope,
    version: 1,
  });
  const store = createStore<TestState>()(() => ({ rows: {}, rowsReplica: createReplicaState() }));
  const slice = createReplicaSlice(resource, {
    driver,
    get: store.getState,
    set: (partial) => store.setState(partial),
    stateKey: 'rowsReplica',
    view: recordLens<TestState, Paged>('rows'),
  });
  return { slice, store };
};

const ids = (data?: Paged) => data?.items.map((item) => item.id);

describe('paged replica direction per key', () => {
  it('appends the next page after the head for a forward key', async () => {
    const { slice, store } = setup();
    const params = { forward: true, topic: 't1' };

    slice.replace(params, page(['a', 'b'], 'after-b'));
    await slice.loadMore('f:t1', params);

    expect(ids(store.getState().rows['f:t1'])).toEqual(['a', 'b', 'c', 'd']);
    expect(store.getState().rows['f:t1']).toMatchObject({ hasMore: false });
  });

  it('keeps prepending older pages for a key the resolver leaves backward', async () => {
    const { slice, store } = setup();
    const params = { forward: false, topic: 't1' };

    slice.replace(params, page(['c', 'd'], 'before-c'));
    await slice.loadMore('b:t1', params);

    expect(ids(store.getState().rows['b:t1'])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps appended pages when a forward head is refreshed', async () => {
    const { slice, store } = setup();
    const params = { forward: true, topic: 't1' };

    slice.replace(params, page(['a', 'b'], 'after-b'));
    await slice.loadMore('f:t1', params);
    slice.replace(params, page(['a', 'b'], 'after-b'));

    expect(ids(store.getState().rows['f:t1'])).toEqual(['a', 'b', 'c', 'd']);
  });
});
