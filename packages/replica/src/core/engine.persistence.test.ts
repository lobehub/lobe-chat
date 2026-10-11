import { describe, expect, it } from 'vitest';

import { defineReplica } from './defineReplica';
import { createReplicaEngine, REPLICA_INDEX_KEY, type ReplicaStorePort } from './engine';
import { arrayEntity } from './entityAdapters';
import { createReplicaState } from './reducer';
import type { ReplicaRow, ReplicaScope, ReplicaState, ReplicaStorage } from './types';

interface Item {
  id: string;
}

const SCOPE = 'u1';
const scopeState = { current: SCOPE, trusted: true };
const scope: ReplicaScope = {
  canPersist: () => scopeState.trusted,
  get: () => scopeState.current,
  use: () => scopeState.current,
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const item = (id: string): Item => ({ id });

/**
 * In-memory storage keyed like the app adapters. `strict: false` builds a
 * legacy adapter without `getStrict`; `failReads` makes reads of the listed row
 * keys fail the way the app adapters do (`get` swallows into a miss,
 * `getStrict` rejects).
 */
const createStorage = ({ strict = true }: { strict?: boolean } = {}) => {
  const rows = new Map<string, ReplicaRow<any>>();
  const failReads = new Set<string>();
  const failRemoves = new Set<string>();
  const writes: string[] = [];
  const id = ({ queryKey, scope }: { queryKey: string; scope: string }) => `${scope}|${queryKey}`;
  const storage: ReplicaStorage<any> = {
    get: async (key) => (failReads.has(key.queryKey) ? undefined : rows.get(id(key))),
    remove: async (key) => {
      if (failRemoves.has(key.queryKey)) throw new Error('delete failed');
      rows.delete(id(key));
    },
    set: async (key, row) => {
      writes.push(key.queryKey);
      rows.set(id(key), row);
    },
  };
  if (strict)
    storage.getStrict = async (key) => {
      if (failReads.has(key.queryKey)) throw new Error('read failed');
      return rows.get(id(key));
    };
  const index = () => (rows.get(`${SCOPE}|${REPLICA_INDEX_KEY}`)?.data as string[]) ?? [];
  const dataKeys = () =>
    [...rows.keys()]
      .filter((key) => !key.endsWith(REPLICA_INDEX_KEY))
      .map((key) => key.slice(SCOPE.length + 1))
      .sort();
  return { dataKeys, failReads, failRemoves, index, rows, storage, writes };
};

/** Minimal host: a record of views plus the bookkeeping slot. */
const createHost = <T>() => {
  let state: ReplicaState<T> = createReplicaState<T>();
  let view: Record<string, T> = {};
  const port: ReplicaStorePort<T> = {
    commit: (writes, next) => {
      for (const write of writes) {
        if ('type' in write) view = {};
        else if (write.data === undefined) {
          const { [write.key]: _dropped, ...rest } = view;
          view = rest;
        } else view = { ...view, [write.key]: write.data };
      }
      state = next;
    },
    getState: () => state,
    keys: () => Object.keys(view),
    read: (key) => view[key],
  };
  return { port, state: () => state, view: () => view };
};

type ListParams = { id: string; q?: string };

const setupList = (storage: ReturnType<typeof createStorage>) => {
  const resource = defineReplica<ListParams, Item[]>({
    key: ({ id }) => id,
    name: 'list',
    query: ({ q }) => ({ q }),
    scope,
    storage: storage.storage,
    version: 1,
  });
  const host = createHost<Item[]>();
  const engine = createReplicaEngine(resource, { entity: arrayEntity<Item>(), port: host.port });
  return { engine, host, resource };
};

const resetScope = () => {
  scopeState.current = SCOPE;
  scopeState.trusted = true;
};

describe('destructive passes need a strict read', () => {
  it('fails a clear on a legacy storage without getStrict instead of reporting success', async () => {
    resetScope();
    const storage = createStorage({ strict: false });
    const first = setupList(storage);
    first.engine.replace({ id: 'a' }, [item('1')]);
    first.engine.replace({ id: 'b' }, [item('2')]);
    await flush();
    // The index row cannot be read on this device: `get` swallows it into a miss.
    storage.failReads.add(REPLICA_INDEX_KEY);

    // A fresh session only knows the rows through the index.
    const { engine } = setupList(storage);
    expect(await engine.clear()).toBe(false);
    expect(storage.dataKeys()).toEqual(['a?{}', 'b?{}']);
    // Hydration stays off while the wipe is incomplete.
    expect(await engine.hydrate({ id: 'a' })).toBe(false);
  });

  it('keeps a removal of a legacy storage unpurged, so every later removal retries it', async () => {
    resetScope();
    const storage = createStorage({ strict: false });
    const first = setupList(storage);
    first.engine.replace({ id: 'a', q: 'x' }, [item('1')]);
    await flush();

    const { engine } = setupList(storage);
    expect(engine.remove('a')).toBe(true);
    await flush();
    // The variant is only known through the index, which cannot be read strictly.
    expect(storage.dataKeys()).toEqual(['a?{"q":"x"}']);
    // Not marked purged: the next removal is dispatched again rather than a no-op.
    expect(engine.remove('a')).toBe(true);
  });

  it('never rewrites an unreadable index as just the new key, and retries the append', async () => {
    resetScope();
    const storage = createStorage();
    const first = setupList(storage);
    first.engine.replace({ id: 'a' }, [item('1')]);
    first.engine.replace({ id: 'b' }, [item('2')]);
    await flush();
    expect(storage.index()).toEqual(['a?{}', 'b?{}']);

    const { engine } = setupList(storage);
    storage.failReads.add(REPLICA_INDEX_KEY);
    engine.replace({ id: 'c' }, [item('3')]);
    await flush();
    // The earlier session's keys survive the failed read.
    expect(storage.index()).toEqual(['a?{}', 'b?{}']);

    storage.failReads.delete(REPLICA_INDEX_KEY);
    engine.replace({ id: 'c' }, [item('3'), item('4')]);
    await flush();
    expect(storage.index()).toEqual(['a?{}', 'b?{}', 'c?{}']);
  });
});
