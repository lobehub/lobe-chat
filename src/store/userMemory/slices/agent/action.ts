import {
  createReplicaSlice,
  recordLens,
  type ReplicaSyncResult,
  scopeIdentityPrefix,
} from '@/libs/replica';
import { userMemoryService } from '@/services/userMemory';
import { type StoreSetter } from '@/store/types';
import { type RetrieveMemoryResult } from '@/types/userMemory';

import { type UserMemoryStore } from '../../store';
import { topicMemoriesResource } from './projection';

type Setter = StoreSetter<UserMemoryStore>;
export const createAgentMemorySlice = (set: Setter, get: () => UserMemoryStore, _api?: unknown) =>
  new AgentMemoryActionImpl(set, get, _api);

export class AgentMemoryActionImpl {
  /**
   * Topic-based memory bundles, keyed by topic id — the replica view the chat
   * send path reads synchronously (see `resolveTopicMemories`).
   */
  readonly #topicMemories;

  constructor(set: Setter, get: () => UserMemoryStore, _api?: unknown) {
    void _api;
    this.#topicMemories = createReplicaSlice(topicMemoriesResource, {
      actionPrefix: 'userMemory/topicMemories',
      fetcher: (topicId) => userMemoryService.retrieveMemoryForTopic(topicId),
      get,
      set,
      stateKey: 'topicMemoriesReplica',
      view: recordLens<UserMemoryStore, RetrieveMemoryResult>('topicMemoriesMap'),
    });
  }

  /** Drop one topic's cached bundle (and its replica bookkeeping entry). */
  clearTopicMemories = (topicId: string): void => {
    this.#topicMemories.remove(topicId);
  };

  /**
   * Drop every topic bundle — memory and every persisted row, including bundles
   * an earlier session wrote in *any* workspace of this identity — then refetch
   * the mounted topics. Called by `purgeAllMemories`, so a reload can never
   * inject deleted memories into the next chat request.
   *
   * The server delete is identity-wide (`deleteAll` is user-scoped) while a
   * replica scope is one workspace, so the purge is widened to the identity's
   * sibling partitions: otherwise switching workspace after a purge would
   * hydrate that partition's surviving bundle before revalidation.
   *
   * Resolves `true` once storage is purged. Memory is wiped synchronously, but
   * a storage failure (a blocked IndexedDB upgrade, a closed connection) leaves
   * a row behind, and the next session has no in-memory record of this clear —
   * it would hydrate that row into the next chat request. Retry once, then
   * report the outcome so the caller surfaces it instead of claiming a purge
   * that a reload would undo.
   */
  internal_clearTopicMemories = async (): Promise<boolean> => {
    const identityPrefix = scopeIdentityPrefix(topicMemoriesResource.scope.get());
    const cleared =
      (await this.#topicMemories.clearScopes(identityPrefix)) ||
      (await this.#topicMemories.clearScopes(identityPrefix));
    void this.#topicMemories.revalidate();
    return cleared;
  };

  /**
   * Fetch orchestration only; read the bundle through `agentMemorySelectors`.
   * One replica entry per topic, so switching topics paints the persisted
   * bundle and the network only confirms it.
   */
  useFetchMemoriesForTopic = (topicId?: string | null): ReplicaSyncResult =>
    this.#topicMemories.useSync(topicId ?? null, { revalidateOnFocus: false });
}

export type AgentMemoryAction = Pick<AgentMemoryActionImpl, keyof AgentMemoryActionImpl>;
