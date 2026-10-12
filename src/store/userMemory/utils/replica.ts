import {
  cacheScope,
  definePagedReplica,
  defineReplica,
  REPLICA_INDEX_KEY,
  type ReplicaScope,
  type ReplicaStorage,
  stableQueryKey,
} from '@/libs/replica';

/**
 * The identity half of a cache scope (`${userId}:${workspaceId}`), with the
 * workspace replaced by a marker no workspace id can take.
 */
export const identityScopeOf = (scope: string): string => {
  const separator = scope.indexOf(':');
  return `${separator === -1 ? scope : scope.slice(0, separator)}:*`;
};

/**
 * User memories belong to the user, not to a workspace: the server reads and
 * deletes them by user id alone (`buildUserMemoryWhere`). Partitioning their
 * replicas per workspace would let "purge all memories" in one workspace leave
 * another workspace's persisted copy to hydrate after a switch, so every
 * userMemory replica is partitioned by identity only — one `clear()` reaches
 * the rows written in every workspace, and a workspace switch keeps showing
 * the same user's memories.
 */
export const userMemoryIdentityScope: ReplicaScope = {
  canHydrate: () => cacheScope.canHydrate?.() ?? true,
  canPersist: () => cacheScope.canPersist(),
  get: () => identityScopeOf(cacheScope.get()),
  use: () => identityScopeOf(cacheScope.use()),
};

/**
 * How many distinct search / sort page sets each memory list keeps persisted
 * (`persist.maxEntries`). The query on screen is pinned by its mounted
 * `useSync`, so it is never evicted; older queries leave IndexedDB and memory
 * together, least recently used first, across reloads too.
 */
export const MAX_RECENT_MEMORY_QUERIES = 8;

/**
 * How many topic memory bundles stay persisted (`persist.maxEntries`). Every
 * visited topic gets its own row; deleted and long-unvisited topics fall out
 * instead of accumulating until a full purge.
 */
export const MAX_RECENT_TOPIC_MEMORIES = 32;

/** `defineReplica` for a userMemory resource: always scoped per user. */
export const defineUserMemoryReplica: typeof defineReplica = (options) =>
  defineReplica({ ...options, scope: userMemoryIdentityScope });

/** `definePagedReplica` for a userMemory list: always scoped per user. */
export const defineUserMemoryPagedReplica: typeof definePagedReplica = (options) =>
  definePagedReplica({ ...options, scope: userMemoryIdentityScope });

/**
 * Wipe a slice's replicas for "delete all memories": memory, every persisted
 * row of the user and reads in flight (`clear()`). A storage failure leaves a
 * row the next session would hydrate back, so a failed purge is retried once.
 * Resolves `false` when a persisted row survived both attempts; the caller
 * (`purgeAllMemories`) surfaces that after its in-memory reset.
 */
export const clearReplicas = async (...clears: (() => Promise<boolean>)[]): Promise<boolean> => {
  let cleared = false;
  for (let attempt = 0; attempt < 2 && !cleared; attempt++) {
    const results = await Promise.all(clears.map((clear) => clear()));
    cleared = results.every(Boolean);
  }
  return cleared;
};

/**
 * Entry key of one memory list page set: the query (search, sort, filters)
 * without the page size. Every query is its own replica entry, so a query
 * switch never overwrites another query's pages and each query hydrates its
 * own persisted head page (the reducer only hydrates an empty entry). With no
 * separate replica `query`, the persisted row key equals the entry key.
 */
export const memoryListKey = <T extends { pageSize?: number; q?: string }>({
  pageSize: _pageSize,
  q,
  ...filters
}: T): string => stableQueryKey({ ...filters, q: q || undefined });

/** The part of a replica slice the user-wide purge needs (structural). */
export interface PurgeableReplica {
  clear: () => Promise<boolean>;
  /** Off-scope `remove(key, scope)` purges that key's rows in `scope` (engine). */
  remove: (key: string, scope?: string) => boolean;
  resource: { storage?: ReplicaStorage<any> };
}

/** How long an off-scope purge waits for its row deletes to land. */
const OFF_SCOPE_PURGE_TIMEOUT = 2000;
const OFF_SCOPE_PURGE_POLL = 25;

/**
 * Purge every persisted row a replica holds in `scope` — a partition that is
 * NOT the active one (the user whose memories were deleted switched account
 * while the server purge ran). The view on screen belongs to the active user
 * and is left alone.
 *
 * Every userMemory resource keys its persisted rows by entry key (no replica
 * `query`), so the partition's index lists entry keys; each goes through the
 * engine's off-scope `remove(key, scope)`, which orders the delete behind the
 * resource's queued writes and refuses to hydrate the key again in this
 * session. Resolves `true` once every indexed row is gone.
 */
const purgeOffScope = async (replica: PurgeableReplica, scope: string): Promise<boolean> => {
  const storage = replica.resource.storage;
  if (!storage) return true;
  const read = (queryKey: string) =>
    storage.getStrict ? storage.getStrict({ queryKey, scope }) : storage.get({ queryKey, scope });

  let keys: string[];
  try {
    keys = ((await read(REPLICA_INDEX_KEY))?.data as unknown as string[] | undefined) ?? [];
  } catch {
    return false;
  }
  for (const key of keys) replica.remove(key, scope);

  const deadline = Date.now() + OFF_SCOPE_PURGE_TIMEOUT;
  for (;;) {
    try {
      const rows = await Promise.all(keys.map((key) => read(key)));
      if (rows.every((row) => row === undefined)) return true;
    } catch {
      return false;
    }
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, OFF_SCOPE_PURGE_POLL));
  }
};

/**
 * `clearReplicas` for the user `user` (a `userMemoryIdentityScope` value).
 * For the active user (or none given) it is the ordinary `clear()`. For
 * another user — an account switch while "delete all memories" ran — it
 * purges that user's persisted partition without touching the active view,
 * so their next session cannot hydrate the deleted memories back.
 */
export const clearUserReplicas = (
  user: string | undefined,
  ...replicas: PurgeableReplica[]
): Promise<boolean> => {
  if (user === undefined || user === userMemoryIdentityScope.get())
    return clearReplicas(...replicas.map((replica) => replica.clear));

  return clearReplicas(...replicas.map((replica) => () => purgeOffScope(replica, user)));
};
