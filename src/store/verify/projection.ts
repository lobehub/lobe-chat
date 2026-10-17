import type { AcceptanceSubjectType } from '@lobechat/types';

import type { VerifyCheckResultItem } from '@/database/schemas/verify';
import { IndexedDBQueryProjectionStorage } from '@/libs/queryProjectionStorage';
import { defineReplica, REPLICA_INDEX_KEY, type ReplicaStorage } from '@/libs/replica';
import type { AcceptanceBundle, AcceptanceBySubject, VerifyStateResponse } from '@/services/verify';

/**
 * The Acceptance aggregate of one acceptance id (`acceptanceBundleMap[id]`):
 * the live review surface read by the Acceptance viewer, the task acceptance
 * tab, the acceptance portal and the workbench embed.
 *
 * Persisted to IndexedDB, so a reload paints the last-seen bundle from the
 * local projection before the network confirms it — a 5s poll keeps the live
 * decision surface current afterwards.
 */
export const acceptanceBundleResource = defineReplica<string, AcceptanceBundle>({
  key: (acceptanceId) => acceptanceId,
  name: 'acceptanceBundle',
  storage: 'indexedDB',
  version: 1,
});

/** The subject (topic / task / document) an acceptance is attached to. */
export interface AcceptanceBySubjectParams {
  subjectId: string;
  subjectType: AcceptanceSubjectType;
}

/** One subject's entry key in `acceptanceBySubjectMap`. */
export const acceptanceBySubjectKey = ({ subjectId, subjectType }: AcceptanceBySubjectParams) =>
  `${subjectType}:${subjectId}`;

/**
 * The standing acceptance aggregate attached to a subject, keyed
 * `<subjectType>:<subjectId>` (`acceptanceBySubjectMap`). A subject without an
 * acceptance resolves to nothing — the sync hook keeps polling at a fast
 * interval to discover the aggregate a later verify run creates.
 */
export const acceptanceBySubjectResource = defineReplica<
  AcceptanceBySubjectParams,
  AcceptanceBySubject,
  AcceptanceBySubject
>({
  key: acceptanceBySubjectKey,
  name: 'acceptanceBySubject',
  storage: 'indexedDB',
  version: 1,
});

/** The plan + rollup status and per-item results of one Agent Run's verify round. */
export interface VerifyRunSnapshot {
  results: VerifyCheckResultItem[];
  /** `null` when the run has no verify state on the server. */
  state: VerifyStateResponse | null;
}

const SETTLED_VERIFY_STATUSES = new Set(['delivered', 'errored', 'failed', 'passed']);

/** Mirrors the server's repair gate: an `errored` check is infra, not a delivery fault. */
const isFailedResult = (result: VerifyCheckResultItem | undefined): boolean =>
  !!result &&
  result.status !== 'errored' &&
  (result.status === 'failed' || result.verdict === 'failed' || result.verdict === 'uncertain');

/**
 * A `failed` run with a failed required `auto_repair` check is about to flip to
 * `repairing` (the server spawns the repair right after settling the verdict),
 * so that verdict is not final yet.
 */
const awaitsAutoRepair = ({ results, state }: VerifyRunSnapshot): boolean => {
  const byItem = new Map(results.map((result) => [result.checkItemId, result]));
  return (state?.verifyPlan ?? []).some(
    (item) =>
      item.required !== false &&
      item.onFail === 'auto_repair' &&
      isFailedResult(byItem.get(item.id)),
  );
};

/** A run whose verdict no longer moves — the only kind worth replaying after a reload. */
export const isSettledVerifyRun = (run: VerifyRunSnapshot | undefined): boolean => {
  const status = run?.state?.verifyStatus;
  if (!status || !SETTLED_VERIFY_STATUSES.has(status)) return false;
  return status !== 'failed' || !awaitsAutoRepair(run);
};

const VERIFY_RUN_NAME = 'verifyRun';
const VERIFY_RUN_VERSION = 1;

/**
 * IndexedDB rows of settled runs only. A planned / verifying / repairing run,
 * or a failed run whose auto-repair is still to come, is never written, so a reload cannot replay a stale spinner or a premature
 * verdict; a settled run that starts moving again has its row dropped. The
 * replica index row passes through untouched.
 */
const settledRunsOnly = (
  storage: ReplicaStorage<VerifyRunSnapshot>,
): ReplicaStorage<VerifyRunSnapshot> => ({
  get: (key) => storage.get(key),
  getStrict: (key) => storage.getStrict!(key),
  remove: (key) => storage.remove(key),
  set: (key, row) =>
    key.queryKey === REPLICA_INDEX_KEY || isSettledVerifyRun(row.data)
      ? storage.set(key, row)
      : storage.remove(key),
});

/**
 * The verify card of one Agent Run (`verifyRunMap[operationId]`), read by the
 * chat thread's Verify message, the verify result portal and the task run
 * detail. State and results live in one entry so a persisted card never pairs
 * a verdict with results from another moment.
 *
 * Settled runs persist to IndexedDB, so a reload paints the last verdict in
 * the first frame and revalidates in the background; LRU-capped because every
 * verified run in history would otherwise keep its row.
 */
export const verifyRunResource = defineReplica<string, VerifyRunSnapshot>({
  key: (operationId) => operationId,
  name: VERIFY_RUN_NAME,
  persist: { maxEntries: 100 },
  storage: settledRunsOnly(
    new IndexedDBQueryProjectionStorage<VerifyRunSnapshot>({
      namespace: `replica:${VERIFY_RUN_NAME}:v${VERIFY_RUN_VERSION}`,
    }),
  ),
  version: VERIFY_RUN_VERSION,
});
