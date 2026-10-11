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
