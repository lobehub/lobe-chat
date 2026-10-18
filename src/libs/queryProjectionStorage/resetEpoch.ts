import { REPLICA_INDEX_KEY } from '@lobechat/replica';

import { localDatabase } from '@/libs/localDatabase';

import type { QueryProjection, QueryProjectionKey } from './types';

/** The IndexedDB collection every query projection row lives in. */
export const PROJECTION_COLLECTION = 'query-projections';

/**
 * The "data context reset" epoch for persisted query projections.
 *
 * A Desktop server switch or disconnect (`resetDataContext`) must retire every
 * row the previous server context persisted: in every cache scope (each
 * `${userId}:${workspaceId}` the user visited, not only the active one — the
 * next server may reuse those ids), and for features whose replicas were never
 * instantiated this session (lazy routes), whose slices cannot `clear()`
 * anything. Rows are keyed `<namespace>:<scope>:<query>`, so they cannot be
 * deleted wholesale either. Instead one epoch counts the resets: the two
 * physical storages (IndexedDB, localStorage) stamp it on the rows they write
 * and read a row from another epoch as absent. Doing it at the physical layer
 * covers every wrapper above it (codecs, size caps), which may rebuild a row
 * and would drop a stamp added on top.
 *
 * A counter, not a timestamp: wall-clock ordering breaks on equal timestamps
 * and on a clock stepping back. The epoch lives in localStorage, so it holds
 * across reloads and is shared by every renderer window (see
 * `handleProjectionEpochStorageEvent`). When it cannot be persisted, the reset
 * deletes the rows instead (see `markProjectionReset`). Until the first reset
 * it is 0 and rows are written unstamped, exactly as before.
 *
 * Memory is not this module's concern: the caller reloads the renderers after
 * a reset (`@/libs/dataContextReset`), so no in-memory state or in-flight
 * request of the previous context survives.
 */
export const PROJECTION_EPOCH_STORAGE_KEY = 'lobe-replica-reset-epoch';
const EPOCH_FIELD = 'resetEpoch';

type StampedRow<T> = QueryProjection<T> & { [EPOCH_FIELD]?: number };

let cachedEpoch: number | undefined;

/**
 * The second signal, independent of localStorage: a reset whose epoch could not
 * be persisted fires no `storage` event. Neither reaches the sending window.
 */
export const PROJECTION_RESET_CHANNEL = 'lobe-replica-reset-epoch';
const resetChannel =
  typeof BroadcastChannel === 'undefined'
    ? undefined
    : new BroadcastChannel(PROJECTION_RESET_CHANNEL);

const readEpoch = (): number => {
  if (cachedEpoch !== undefined) return cachedEpoch;
  let epoch = 0;
  try {
    if (typeof window !== 'undefined')
      epoch = Number(localStorage.getItem(PROJECTION_EPOCH_STORAGE_KEY)) || 0;
  } catch {
    // Storage access denied: the epoch stays in memory for this session.
  }
  cachedEpoch = epoch;
  return epoch;
};

/** localStorage namespaces of the projection storages built this session. */
const localNamespaces = new Set<string>(['replica']);

/** Called by `LocalStorageQueryProjectionStorage` so a fallback purge can find its rows. */
export const registerLocalProjectionNamespace = (namespace: string): void => {
  localNamespaces.add(namespace);
};

const persistEpoch = (epoch: number): boolean => {
  try {
    localStorage.setItem(PROJECTION_EPOCH_STORAGE_KEY, String(epoch));
    return localStorage.getItem(PROJECTION_EPOCH_STORAGE_KEY) === String(epoch);
  } catch {
    return false;
  }
};

/** Delete every persisted projection row (IndexedDB collection and localStorage tier). */
const purgeAllProjections = async (): Promise<void> => {
  await localDatabase.initialize();
  await localDatabase.deleteByPrefix(PROJECTION_COLLECTION, '');
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key && [...localNamespaces].some((namespace) => key.startsWith(`${namespace}:`)))
        localStorage.removeItem(key);
    }
  } catch {
    // Storage access denied: its tier cannot be read back after a reload either.
  }
};

/**
 * Record that every persisted row belongs to a server context that is gone.
 * When the new epoch cannot be persisted (e.g. the localStorage quota is
 * exhausted while IndexedDB still works), a reload would read the old epoch
 * back and revive those rows, so they are deleted instead. Resolves once the
 * rows are unreadable after a reload.
 */
export const markProjectionReset = async (): Promise<void> => {
  const epoch = readEpoch() + 1;
  cachedEpoch = epoch;
  if (typeof window === 'undefined') return;
  const persisted = persistEpoch(epoch);
  // Tell the other renderers even when the localStorage write failed: then no
  // `storage` event fires, and they would keep the previous server's state.
  resetChannel?.postMessage(epoch);
  if (!persisted) await purgeAllProjections();
};

/** Forget the cached epoch (tests: a fresh session re-reads localStorage). */
export const resetProjectionEpochCache = (): void => {
  cachedEpoch = undefined;
};

const remoteResetListeners = new Set<() => void>();

/**
 * Subscribe to a reset another renderer made (e.g. the Desktop main window
 * switching servers while a topic popup is open). Windows share localStorage
 * and IndexedDB but not memory, so each must follow (reload); the epoch has
 * already been advanced by the other window.
 */
export const subscribeRemoteProjectionReset = (listener: () => void) => {
  remoteResetListeners.add(listener);
  return () => {
    remoteResetListeners.delete(listener);
  };
};

/**
 * Apply an epoch another renderer reset to. Both signals deliver each epoch and
 * their queues are not ordered against each other, so a late notification of
 * an older reset is ignored rather than moving the epoch backward.
 */
const applyRemoteEpoch = (epoch: number): void => {
  if (cachedEpoch !== undefined && epoch <= cachedEpoch) return;
  cachedEpoch = epoch;
  for (const listener of remoteResetListeners) listener();
};

/** A `storage` event: another renderer persisted a new epoch. */
export const handleProjectionEpochStorageEvent = ({
  key,
  newValue,
}: Pick<StorageEvent, 'key' | 'newValue'>): void => {
  if (key !== PROJECTION_EPOCH_STORAGE_KEY) return;
  applyRemoteEpoch(Number(newValue) || 0);
};

// Another renderer's reset, through the channel declared above.
resetChannel?.addEventListener('message', ({ data }: MessageEvent) => {
  applyRemoteEpoch(Number(data) || 0);
});

if (typeof window !== 'undefined')
  window.addEventListener('storage', handleProjectionEpochStorageEvent);

/** The row as it is written: stamped with the epoch once there has been a reset. */
export const stampProjection = <T>(projection: QueryProjection<T>): QueryProjection<T> => {
  const epoch = readEpoch();
  if (epoch === 0) return projection;
  const stamped: StampedRow<T> = { ...projection, [EPOCH_FIELD]: epoch };
  return stamped;
};

/**
 * The row as it is read: absent when it belongs to another epoch, without the
 * stamp otherwise. The per-scope replica index row is never hidden: it lists
 * keys, not data, and the replica engine enumerates it to purge and evict rows
 * — hiding it would orphan the previous context's rows outside every clear.
 */
export const readProjection = <T>(
  { queryKey }: QueryProjectionKey,
  row: QueryProjection<T> | undefined,
): QueryProjection<T> | undefined => {
  if (row === undefined) return undefined;
  const { [EPOCH_FIELD]: epoch = 0, ...projection } = row as StampedRow<T>;
  if (queryKey !== REPLICA_INDEX_KEY && epoch !== readEpoch()) return undefined;
  return projection;
};
