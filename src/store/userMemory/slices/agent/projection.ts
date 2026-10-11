import { cacheScope, defineReplica, type ReplicaScope } from '@/libs/replica';
import { type RetrieveMemoryResult } from '@/types/userMemory';

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
 * replica per workspace would let "purge all memories" in one workspace leave
 * another workspace's persisted copy to hydrate after a switch, so the replica
 * is partitioned by identity only — `clear()` then reaches every workspace.
 */
export const userMemoryIdentityScope: ReplicaScope = {
  canHydrate: () => cacheScope.canHydrate?.() ?? true,
  canPersist: () => cacheScope.canPersist(),
  get: () => identityScopeOf(cacheScope.get()),
  use: () => identityScopeOf(cacheScope.use()),
};

/**
 * The memories retrieved for one topic (`topicMemoriesMap[topicId]`), injected
 * into the chat context.
 *
 * Keyed by the topic: the backend builds the query from the topic itself, so
 * the topic id is the whole entry identity. Read-only and persisted, so a
 * reload / a revisit paints the last confirmed bundle before the network only
 * confirms it — the chat send path reads it synchronously and must not wait on
 * a fetch. Scoped per identity (see `userMemoryIdentityScope`).
 */
export const topicMemoriesResource = defineReplica<string, RetrieveMemoryResult>({
  key: (topicId) => topicId,
  name: 'userMemoryTopicMemories',
  scope: userMemoryIdentityScope,
  storage: 'indexedDB',
  version: 1,
});
