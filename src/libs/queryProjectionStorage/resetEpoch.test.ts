import { REPLICA_INDEX_KEY } from '@lobechat/replica';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalStorageQueryProjectionStorage } from './localStorage';
import {
  handleProjectionEpochStorageEvent,
  markProjectionScopeReset,
  resetProjectionScopeEpochs,
  subscribeRemoteProjectionScopeReset,
} from './resetEpoch';

const KEY = { queryKey: 'a', scope: 'u1:ws1' };
const storage = () => new LocalStorageQueryProjectionStorage<string>({ namespace: 'replica:t:v1' });

describe('projection reset epochs', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProjectionScopeEpochs();
  });

  it('writes rows unchanged until the scope is first reset', async () => {
    await storage().set(KEY, { data: 'cached', updatedAt: 1 });

    expect(storage().getSync(KEY)).toEqual({ data: 'cached', updatedAt: 1 });
  });

  it('reads rows the previous data context wrote as absent', async () => {
    await storage().set(KEY, { data: 'previous context', updatedAt: 1 });

    markProjectionScopeReset('u1:ws1');

    expect(await storage().get(KEY)).toBeUndefined();
    expect(await storage().getStrict(KEY)).toBeUndefined();
    expect(storage().getSync(KEY)).toBeUndefined();
  });

  it('keeps rows written after the reset, and other scopes', async () => {
    const other = { ...KEY, scope: 'u2:ws1' };
    await storage().set(other, { data: 'other scope', updatedAt: 1 });
    markProjectionScopeReset('u1:ws1');

    // Same timestamp as anything before: ordering does not rely on the clock.
    await storage().set(KEY, { data: 'new context', updatedAt: 1 });

    expect(await storage().get(KEY)).toEqual({ data: 'new context', updatedAt: 1 });
    expect(await storage().get(other)).toEqual({ data: 'other scope', updatedAt: 1 });
  });

  it('retires rows written between two resets, and holds across a reload', async () => {
    markProjectionScopeReset('u1:ws1');
    await storage().set(KEY, { data: 'second context', updatedAt: 5 });

    resetProjectionScopeEpochs(); // reload: the epoch is re-read from localStorage
    expect(await storage().get(KEY)).toEqual({ data: 'second context', updatedAt: 5 });

    markProjectionScopeReset('u1:ws1');
    expect(await storage().get(KEY)).toBeUndefined();
  });

  it('survives a wrapper that rebuilds the row from data and updatedAt', async () => {
    // e.g. the project-file persist codec: `{ data: encode(row.data), updatedAt }`.
    const inner = storage();
    markProjectionScopeReset('u1:ws1');

    await inner.set(KEY, { data: 'new context', updatedAt: 7 });
    const row = await inner.get(KEY);
    await inner.set(KEY, { data: row!.data, updatedAt: row!.updatedAt });

    expect(await inner.get(KEY)).toEqual({ data: 'new context', updatedAt: 7 });
  });

  it('follows a reset another renderer made (Desktop popup vs main window)', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeRemoteProjectionScopeReset(listener);
    await storage().set(KEY, { data: 'previous context', updatedAt: 1 });
    expect(await storage().get(KEY)).toBeDefined(); // this window caches epoch 0

    // The main window advanced the shared epoch; only a `storage` event says so.
    localStorage.setItem('lobe-replica-reset-epoch:u1:ws1', '1');
    handleProjectionEpochStorageEvent({ key: 'lobe-replica-reset-epoch:u1:ws1', newValue: '1' });

    expect(await storage().get(KEY)).toBeUndefined();
    expect(listener).toHaveBeenCalledWith('u1:ws1');
    // Rows this window writes now carry the shared epoch.
    await storage().set(KEY, { data: 'new context', updatedAt: 2 });
    expect(await storage().get(KEY)).toEqual({ data: 'new context', updatedAt: 2 });
    unsubscribe();
  });

  it('never hides the replica index, so a purge can still enumerate old rows', async () => {
    const indexKey = { queryKey: REPLICA_INDEX_KEY, scope: 'u1:ws1' };
    await storage().set(indexKey, { data: '["a"]', updatedAt: 1 });

    markProjectionScopeReset('u1:ws1');

    expect(await storage().getStrict(indexKey)).toEqual({ data: '["a"]', updatedAt: 1 });
  });
});
