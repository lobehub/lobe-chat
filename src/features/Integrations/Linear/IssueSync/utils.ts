import type { LinearIssueStateType, LinearSyncResult } from '@lobechat/types';
import { LINEAR_ISSUE_STATE_TYPES } from '@lobechat/types';
import { TRPCClientError } from '@trpc/client';
import type { TFunction } from 'i18next';

/** Server message for a revoked or expired Linear token (`LINEAR_RECONNECT_REQUIRED`). */
const RECONNECT_REQUIRED = 'LINEAR_RECONNECT_REQUIRED';

export const linearSyncErrorMessage = (error: unknown, t: TFunction<'integration'>): string =>
  error instanceof TRPCClientError && error.message === RECONNECT_REQUIRED
    ? t('linear.sync.error.reconnect')
    : t('linear.sync.error.generic');

/** One-line outcome of a sync, e.g. "2 created · 1 updated · 1 closed". */
export const formatLinearSyncResult = (
  result: LinearSyncResult,
  t: TFunction<'integration'>,
): string => {
  const parts = [
    result.created && t('linear.sync.result.created', { count: result.created }),
    result.updated && t('linear.sync.result.updated', { count: result.updated }),
    result.closed && t('linear.sync.result.closed', { count: result.closed }),
    result.keptLocalEdits &&
      t('linear.sync.result.keptLocalEdits', { count: result.keptLocalEdits }),
    result.skipped.length && t('linear.sync.result.skipped', { count: result.skipped.length }),
  ].filter(Boolean) as string[];
  if (parts.length === 0) parts.push(t('linear.sync.result.upToDate'));
  if (result.truncated) parts.push(t('linear.sync.result.truncated'));
  return parts.join(' · ');
};

/** One result for several sync calls, e.g. an import split into batches. */
export const mergeLinearSyncResults = (results: LinearSyncResult[]): LinearSyncResult =>
  results.reduce(
    (total, result) => ({
      closed: total.closed + result.closed,
      created: total.created + result.created,
      keptLocalEdits: total.keptLocalEdits + result.keptLocalEdits,
      skipped: [...total.skipped, ...result.skipped],
      truncated: total.truncated || result.truncated,
      unchanged: total.unchanged + result.unchanged,
      updated: total.updated + result.updated,
    }),
    {
      closed: 0,
      created: 0,
      keptLocalEdits: 0,
      skipped: [],
      truncated: false,
      unchanged: 0,
      updated: 0,
    } as LinearSyncResult,
  );

export const linearStateTypeOptions = (t: TFunction<'integration'>) =>
  LINEAR_ISSUE_STATE_TYPES.map((type: LinearIssueStateType) => ({
    label: t(`linear.sync.state.${type}`),
    value: type,
  }));
