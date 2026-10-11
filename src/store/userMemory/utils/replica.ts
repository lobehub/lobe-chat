import { cacheScope, definePagedReplica, defineReplica, type ReplicaScope } from '@/libs/replica';

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
