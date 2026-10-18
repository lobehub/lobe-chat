import { REPLICA_INDEX_KEY } from '@lobechat/replica';

import type { QueryProjection, QueryProjectionKey } from './types';

/**
 * The "data context reset" epoch for persisted query projections.
 *
 * `stores.reset()` (a Desktop server switch or disconnect) must retire every
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
 * `handleProjectionEpochStorageEvent`). Until the first reset it is 0 and rows
 * are written unstamped, exactly as before.
 */
export const PROJECTION_EPOCH_STORAGE_KEY = 'lobe-replica-reset-epoch';
const EPOCH_FIELD = 'resetEpoch';

type StampedRow<T> = QueryProjection<T> & { [EPOCH_FIELD]?: number };

let cachedEpoch: number | undefined;

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

/** Record that every persisted row belongs to a server context that is gone. */
export const markProjectionReset = (): void => {
  const epoch = readEpoch() + 1;
  cachedEpoch = epoch;
  try {
    if (typeof window !== 'undefined')
      localStorage.setItem(PROJECTION_EPOCH_STORAGE_KEY, String(epoch));
  } catch {
    // The in-memory epoch still guards this session.
  }
};

/** Forget the cached epoch (tests: a fresh session re-reads localStorage). */
export const resetProjectionEpochCache = (): void => {
  cachedEpoch = undefined;
};

const remoteResetListeners = new Set<() => void>();

/**
 * Subscribe to a reset another renderer made (e.g. the Desktop main window
 * switching servers while a topic popup is open). Windows share localStorage
 * and IndexedDB but not memory, so each must drop its cached epoch and its own
 * in-memory replicas; the epoch has already been advanced by the other window.
 */
export const subscribeRemoteProjectionReset = (listener: () => void) => {
  remoteResetListeners.add(listener);
  return () => {
    remoteResetListeners.delete(listener);
  };
};

/** Apply an epoch another renderer persisted (`storage` events reach only the other windows). */
export const handleProjectionEpochStorageEvent = ({
  key,
  newValue,
}: Pick<StorageEvent, 'key' | 'newValue'>): void => {
  if (key !== PROJECTION_EPOCH_STORAGE_KEY) return;
  const epoch = Number(newValue) || 0;
  if (cachedEpoch === epoch) return;
  cachedEpoch = epoch;
  for (const listener of remoteResetListeners) listener();
};

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
