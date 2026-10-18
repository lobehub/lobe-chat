import { REPLICA_INDEX_KEY } from '@lobechat/replica';

import type { QueryProjection, QueryProjectionKey } from './types';

/**
 * Per-scope "data context reset" epochs for persisted query projections.
 *
 * `stores.reset()` (a Desktop server switch or disconnect) must retire the
 * rows the previous context persisted, including those of features whose
 * replicas were never instantiated this session (lazy routes) — a slice that
 * does not exist cannot `clear()` its rows. Rows are keyed
 * `<namespace>:<scope>:<query>`, so they cannot be deleted by scope either.
 * Instead each scope has an epoch that every reset advances: the two physical
 * storages (IndexedDB, localStorage) stamp it on the rows they write and read
 * a row from another epoch as absent. Doing it at the physical layer covers
 * every wrapper above it (codecs, size caps), which may rebuild a row and
 * would drop a stamp added on top.
 *
 * A counter, not a timestamp: wall-clock ordering breaks on equal timestamps
 * and on a clock stepping back. The epoch lives in localStorage, so it holds
 * across reloads. Until a scope's first reset it is 0 and rows are written
 * unstamped, exactly as before.
 */
const EPOCH_PREFIX = 'lobe-replica-reset-epoch:';
const EPOCH_FIELD = 'resetEpoch';

type StampedRow<T> = QueryProjection<T> & { [EPOCH_FIELD]?: number };

const epochs = new Map<string, number>();

const readEpoch = (scope: string): number => {
  const cached = epochs.get(scope);
  if (cached !== undefined) return cached;
  let epoch = 0;
  try {
    if (typeof window !== 'undefined')
      epoch = Number(localStorage.getItem(EPOCH_PREFIX + scope)) || 0;
  } catch {
    // Storage access denied: epochs stay in memory for this session.
  }
  epochs.set(scope, epoch);
  return epoch;
};

/** Record that `scope`'s persisted rows belong to a data context that is gone. */
export const markProjectionScopeReset = (scope: string): void => {
  const epoch = readEpoch(scope) + 1;
  epochs.set(scope, epoch);
  try {
    if (typeof window !== 'undefined') localStorage.setItem(EPOCH_PREFIX + scope, String(epoch));
  } catch {
    // The in-memory epoch still guards this session.
  }
};

/** Forget the cached epochs (tests: a fresh session re-reads localStorage). */
export const resetProjectionScopeEpochs = (): void => {
  epochs.clear();
};

/** The row as it is written: stamped with the scope's epoch once it has one. */
export const stampProjection = <T>(
  { scope }: QueryProjectionKey,
  projection: QueryProjection<T>,
): QueryProjection<T> => {
  const epoch = readEpoch(scope);
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
  { queryKey, scope }: QueryProjectionKey,
  row: QueryProjection<T> | undefined,
): QueryProjection<T> | undefined => {
  if (row === undefined) return undefined;
  const { [EPOCH_FIELD]: epoch = 0, ...projection } = row as StampedRow<T>;
  if (queryKey !== REPLICA_INDEX_KEY && epoch !== readEpoch(scope)) return undefined;
  return projection;
};
