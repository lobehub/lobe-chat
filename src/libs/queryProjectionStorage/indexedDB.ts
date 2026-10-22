import { KeyValueReplicaStorage } from '@lobechat/replica';

import { localDatabase } from '@/libs/localDatabase';

interface IndexedDBQueryProjectionStorageOptions {
  namespace: string;
}

const COLLECTION = 'query-projections';

/** Replica rows in the app's local database (IndexedDB on the web, SQLite in Electron). */
export class IndexedDBQueryProjectionStorage<T> extends KeyValueReplicaStorage<T> {
  constructor({ namespace }: IndexedDBQueryProjectionStorageOptions) {
    super({
      namespace,
      // Resolve `localDatabase` per call: the active adapter can be swapped at boot.
      store: {
        delete: (key) => localDatabase.delete(COLLECTION, key),
        get: (key) => localDatabase.get(COLLECTION, key),
        initialize: () => localDatabase.initialize(),
        set: (key, value) => localDatabase.set(COLLECTION, key, value),
      },
    });
  }
}
