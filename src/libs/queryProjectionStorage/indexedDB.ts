import { localDatabase } from '@/libs/localDatabase';

import type { QueryProjection, QueryProjectionKey, QueryProjectionStorage } from './types';

interface IndexedDBQueryProjectionStorageOptions {
  namespace: string;
}

const COLLECTION = 'query-projections';

export class IndexedDBQueryProjectionStorage<T> implements QueryProjectionStorage<T> {
  readonly #namespace: string;

  constructor({ namespace }: IndexedDBQueryProjectionStorageOptions) {
    this.#namespace = namespace;
  }

  #key = ({ queryKey, scope }: QueryProjectionKey) =>
    `${this.#namespace}:${encodeURIComponent(scope)}:${encodeURIComponent(queryKey)}`;

  get = async (key: QueryProjectionKey): Promise<QueryProjection<T> | undefined> => {
    try {
      return await this.getStrict(key);
    } catch {
      return undefined;
    }
  };

  /**
   * Rejects when the delete did not land, unlike reads and writes: a caller
   * that removes a row the user deleted must be able to retry it.
   */
  /** Like `get`, but rejects when the row could not be read (see `ReplicaStorage.getStrict`). */
  getStrict = async (key: QueryProjectionKey): Promise<QueryProjection<T> | undefined> => {
    await localDatabase.initialize();
    return localDatabase.get<QueryProjection<T>>(COLLECTION, this.#key(key));
  };

  remove = async (key: QueryProjectionKey): Promise<void> => {
    await localDatabase.initialize();
    await localDatabase.delete(COLLECTION, this.#key(key));
  };

  /**
   * Delete every row of this resource whose scope starts with `scopePrefix` —
   * one identity's partitions (see `ReplicaStorage.purgeScopePrefix`). The
   * scope is encoded into the storage key, so the encoded prefix selects
   * exactly those rows. Rejects when the delete did not land, like `remove`.
   */
  purgeScopePrefix = async (scopePrefix: string): Promise<void> => {
    await localDatabase.initialize();
    await localDatabase.deleteByPrefix(
      COLLECTION,
      `${this.#namespace}:${encodeURIComponent(scopePrefix)}`,
    );
  };

  set = async (key: QueryProjectionKey, projection: QueryProjection<T>): Promise<void> => {
    try {
      await localDatabase.initialize();
      await localDatabase.set(COLLECTION, this.#key(key), projection);
    } catch {
      // Projection persistence is best-effort; the server remains the durable SoT.
    }
  };
}
