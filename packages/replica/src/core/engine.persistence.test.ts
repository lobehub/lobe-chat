import { describe, expect, it, vi } from 'vitest';

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
  const failSets = new Set<string>();
  const writes: string[] = [];
  const id = ({ queryKey, scope }: { queryKey: string; scope: string }) => `${scope}|${queryKey}`;
  const storage: ReplicaStorage<any> = {
    get: async (key) => (failReads.has(key.queryKey) ? undefined : rows.get(id(key))),
    remove: async (key) => {
      if (failRemoves.has(key.queryKey)) throw new Error('delete failed');
      rows.delete(id(key));
    },
    set: async (key, row) => {
      if (failSets.has(key.queryKey)) throw new Error('write failed');
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
  return { dataKeys, failReads, failRemoves, failSets, index, rows, storage, writes };
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
  const engine = createReplicaEngine(resource, { entity: arrayEntity<Item>((entry) => entry.id), port: host.port });
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

describe('removeEntity keeps its guard until the persisted patch lands', () => {
  /** A session that persisted `b` (holding entity `1`), then a fresh engine. */
  const persistedB = async () => {
    const storage = createStorage();
    const first = setupList(storage);
    first.engine.replace({ id: 'b' }, [item('1'), item('2')]);
    await flush();
    return { storage, ...setupList(storage) };
  };

  it('a failed index read keeps the guard, so a later hydrate strips the entity', async () => {
    resetScope();
    const { engine, host, storage } = await persistedB();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    storage.failReads.add(REPLICA_INDEX_KEY);

    engine.removeEntity('1');
    await flush();
    // The unloaded row still holds the deleted entity…
    expect(storage.rows.get(`${SCOPE}|b?{}`)?.data).toEqual([item('1'), item('2')]);

    // …but a hydrate that starts long after the failed patch never paints it.
    expect(await engine.hydrate({ id: 'b' })).toBe(true);
    expect(host.view().b).toEqual([item('2')]);
    errors.mockRestore();
  });

  it('an untrusted scope keeps the guard, and a later successful removal releases it', async () => {
    resetScope();
    const { engine, host, storage } = await persistedB();
    scopeState.trusted = false;

    engine.removeEntity('1');
    await flush();
    expect(storage.rows.get(`${SCOPE}|b?{}`)?.data).toEqual([item('1'), item('2')]);
    expect(await engine.hydrate({ id: 'b' })).toBe(true);
    expect(host.view().b).toEqual([item('2')]);

    // Once trusted, a repeated removal of an unloaded row lands its patch.
    scopeState.trusted = true;
    const fresh = setupList(storage);
    fresh.engine.removeEntity('1');
    await flush();
    expect(storage.rows.get(`${SCOPE}|b?{}`)?.data).toEqual([item('2')]);
  });
});

describe('redundant persist writes', () => {
  const rowWrites = (storage: ReturnType<typeof createStorage>, queryKey: string) =>
    storage.writes.filter((key) => key === queryKey).length;

  it('skips a revalidation whose value equals what this session persisted', async () => {
    resetScope();
    const storage = createStorage();
    const { engine } = setupList(storage);
    engine.replace({ id: 'a' }, [item('1')]);
    await flush();
    // A fresh but deep-equal response.
    engine.replace({ id: 'a' }, [item('1')]);
    await flush();
    expect(rowWrites(storage, 'a?{}')).toBe(1);

    engine.replace({ id: 'a' }, [item('1'), item('2')]);
    await flush();
    expect(rowWrites(storage, 'a?{}')).toBe(2);
  });

  it('skips a revalidation equal to the row it hydrated, and writes one that differs', async () => {
    resetScope();
    const storage = createStorage();
    storage.rows.set(`${SCOPE}|a?{}`, { data: [item('1')], updatedAt: 1 });
    storage.rows.set(`${SCOPE}|b?{}`, { data: [item('old')], updatedAt: 1 });
    const { engine } = setupList(storage);
    await engine.hydrate({ id: 'a' });
    await engine.hydrate({ id: 'b' });

    engine.replace({ id: 'a' }, [item('1')]);
    engine.replace({ id: 'b' }, [item('new')]);
    await flush();
    expect(rowWrites(storage, 'a?{}')).toBe(0);
    expect(rowWrites(storage, 'b?{}')).toBe(1);
  });

  it('writes again after a failed write, a removal or a clear', async () => {
    resetScope();
    const storage = createStorage();
    const { engine } = setupList(storage);
    storage.failSets.add('a?{}');
    engine.replace({ id: 'a' }, [item('1')]);
    await flush();
    storage.failSets.delete('a?{}');
    engine.replace({ id: 'a' }, [item('1')]);
    await flush();
    expect(storage.rows.get(`${SCOPE}|a?{}`)?.data).toEqual([item('1')]);

    engine.remove('a');
    await flush();
    expect(storage.rows.has(`${SCOPE}|a?{}`)).toBe(false);
    engine.replace({ id: 'a' }, [item('1')]);
    await flush();
    expect(storage.rows.get(`${SCOPE}|a?{}`)?.data).toEqual([item('1')]);

    expect(await engine.clear()).toBe(true);
    engine.replace({ id: 'a' }, [item('1')]);
    await flush();
    expect(storage.rows.get(`${SCOPE}|a?{}`)?.data).toEqual([item('1')]);
  });

  it('writes again after an entity patch rewrote the row behind it', async () => {
    resetScope();
    const storage = createStorage();
    const { engine } = setupList(storage);
    engine.replace({ id: 'a' }, [item('1'), item('2')]);
    // The entry moves on to another query: the first row is no longer loaded.
    engine.replace({ id: 'a', q: 'x' }, [item('2')]);
    await flush();

    engine.updateEntity<Item>('1', () => ({ id: '1', renamed: true }) as Item);
    await flush();
    expect(storage.rows.get(`${SCOPE}|a?{}`)?.data).toEqual([
      { id: '1', renamed: true },
      item('2'),
    ]);

    // Back to the first query with the original value: the row must be rewritten.
    engine.replace({ id: 'a' }, [item('1'), item('2')]);
    await flush();
    expect(storage.rows.get(`${SCOPE}|a?{}`)?.data).toEqual([item('1'), item('2')]);
  });
});
