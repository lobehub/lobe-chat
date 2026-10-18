import { REPLICA_INDEX_KEY, type ReplicaStorage } from '@lobechat/replica';

/**
 * Per-scope "data context reset" marks for the persisted replica rows.
 *
 * `stores.reset()` (a Desktop server switch or disconnect) must also retire the
 * rows the previous context persisted, including those of features whose
 * replicas were never instantiated this session (lazy routes) — a slice that
 * does not exist cannot `clear()` its rows. Rows are keyed
 * `replica:<name>:v<n>:<scope>:<query>`, so they cannot be deleted by scope
 * either. Instead the reset records when it happened for the scope, and every
 * app storage treats a row written before that as absent. The mark lives in
 * localStorage, so it holds across reloads; rows written after the reset carry
 * a later `updatedAt` and read normally.
 */
const MARK_PREFIX = 'lobe-replica-reset:';

const marks = new Map<string, number>();

const readMark = (scope: string): number => {
  const cached = marks.get(scope);
  if (cached !== undefined) return cached;
  let mark = 0;
  try {
    if (typeof window !== 'undefined')
      mark = Number(localStorage.getItem(MARK_PREFIX + scope)) || 0;
  } catch {
    // Storage access denied: no mark beyond this session's.
  }
  marks.set(scope, mark);
  return mark;
};

/** Newest `updatedAt` this session wrote per scope (a later mark must cover it). */
const written = new Map<string, number>();

/**
 * Record that `scope`'s persisted rows belong to a data context that is gone.
 * The mark only moves forward — past the previous mark and past every row this
 * session wrote — so equal timestamps or a clock stepping back between two
 * resets cannot leave the abandoned context's rows newer than it.
 */
export const markReplicaScopeReset = (scope: string, at = Date.now()): void => {
  const mark = Math.max(at, readMark(scope) + 1, written.get(scope) ?? 0);
  marks.set(scope, mark);
  try {
    if (typeof window !== 'undefined') localStorage.setItem(MARK_PREFIX + scope, String(mark));
  } catch {
    // The in-memory mark still guards this session.
  }
};

/** Forget every mark (tests). */
export const resetReplicaScopeMarks = (): void => {
  marks.clear();
  written.clear();
};

/**
 * The per-scope index row is never hidden: it lists keys, not data, and the
 * engine enumerates it to purge and evict rows — hiding it would orphan the
 * previous context's rows outside every future clear.
 */
const isRetired = (
  { queryKey, scope }: { queryKey: string; scope: string },
  row: { updatedAt: number } | undefined,
) => row !== undefined && queryKey !== REPLICA_INDEX_KEY && row.updatedAt <= readMark(scope);

type SyncReadable<TData> = ReplicaStorage<TData> & {
  /** Pre-paint read of the localStorage tier (`LocalStorageQueryProjectionStorage`). */
  getSync?: (key: Parameters<ReplicaStorage<TData>['get']>[0]) => unknown;
};

/** Wrap an app replica storage so rows from before a scope reset read as absent. */
export const guardResetRows = <TData>(storage: ReplicaStorage<TData>): ReplicaStorage<TData> => {
  // Bound explicitly, not spread: a class storage may keep its methods on the prototype.
  const inner = storage as SyncReadable<TData>;
  const guarded: SyncReadable<TData> = {
    get: async (key) => {
      const row = await inner.get(key);
      return isRetired(key, row) ? undefined : row;
    },
    remove: (key) => inner.remove(key),
    // A row written in the reset's millisecond (or after the clock stepped
    // back) must still read as post-reset: stamp it past the mark.
    set: (key, row) => {
      const mark = readMark(key.scope);
      const stamped = row.updatedAt > mark ? row : { ...row, updatedAt: mark + 1 };
      written.set(key.scope, Math.max(written.get(key.scope) ?? 0, stamped.updatedAt));
      return inner.set(key, stamped);
    },
  };
  if (inner.getStrict) {
    guarded.getStrict = async (key) => {
      const row = await inner.getStrict!(key);
      return isRetired(key, row) ? undefined : row;
    };
  }
  if (inner.getSync) {
    guarded.getSync = (key) => {
      const row = inner.getSync!(key) as { updatedAt: number } | undefined;
      return isRetired(key, row) ? undefined : row;
    };
  }
  return guarded;
};
