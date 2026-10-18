import { REPLICA_INDEX_KEY } from '@lobechat/replica';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { localDatabase } from '@/libs/localDatabase';

import { LocalStorageQueryProjectionStorage } from './localStorage';
import {
  handleProjectionEpochStorageEvent,
  markProjectionReset,
  PROJECTION_EPOCH_STORAGE_KEY,
  resetProjectionEpochCache,
  subscribeRemoteProjectionReset,
} from './resetEpoch';

const KEY = { queryKey: 'a', scope: 'u1:ws1' };
const storage = () => new LocalStorageQueryProjectionStorage<string>({ namespace: 'replica:t:v1' });

describe('projection reset epoch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    resetProjectionEpochCache();
  });

  it('writes rows unchanged until the first reset', async () => {
    await storage().set(KEY, { data: 'cached', updatedAt: 1 });

    expect(storage().getSync(KEY)).toEqual({ data: 'cached', updatedAt: 1 });
  });

  it('reads rows the previous server context wrote as absent', async () => {
    await storage().set(KEY, { data: 'previous context', updatedAt: 1 });

    await markProjectionReset();

    expect(await storage().get(KEY)).toBeUndefined();
    expect(await storage().getStrict(KEY)).toBeUndefined();
    expect(storage().getSync(KEY)).toBeUndefined();
  });

  it('retires rows of every scope, not only the active workspace', async () => {
    // A workspace the user cached earlier; the next server may reuse its ids.
    const otherWorkspace = { ...KEY, scope: 'u1:ws2' };
    await storage().set(otherWorkspace, { data: 'previous context', updatedAt: 1 });

    await markProjectionReset();

    expect(await storage().get(otherWorkspace)).toBeUndefined();
  });

  it('keeps rows written after the reset, whatever their timestamp', async () => {
    await markProjectionReset();

    // Same timestamp as anything before: ordering does not rely on the clock.
    await storage().set(KEY, { data: 'new context', updatedAt: 1 });

    expect(await storage().get(KEY)).toEqual({ data: 'new context', updatedAt: 1 });
  });

  it('retires rows written between two resets, and holds across a reload', async () => {
    await markProjectionReset();
    await storage().set(KEY, { data: 'second context', updatedAt: 5 });

    resetProjectionEpochCache(); // reload: the epoch is re-read from localStorage
    expect(await storage().get(KEY)).toEqual({ data: 'second context', updatedAt: 5 });

    await markProjectionReset();
    expect(await storage().get(KEY)).toBeUndefined();
  });

  it('survives a wrapper that rebuilds the row from data and updatedAt', async () => {
    // e.g. the project-file persist codec: `{ data: encode(row.data), updatedAt }`.
    const inner = storage();
    await markProjectionReset();

    await inner.set(KEY, { data: 'new context', updatedAt: 7 });
    const row = await inner.get(KEY);
    await inner.set(KEY, { data: row!.data, updatedAt: row!.updatedAt });

    expect(await inner.get(KEY)).toEqual({ data: 'new context', updatedAt: 7 });
  });

  it('follows a reset another renderer made (Desktop popup vs main window)', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeRemoteProjectionReset(listener);
    await storage().set(KEY, { data: 'previous context', updatedAt: 1 });
    expect(await storage().get(KEY)).toBeDefined(); // this window caches epoch 0

    // The main window advanced the shared epoch; only a `storage` event says so.
    localStorage.setItem(PROJECTION_EPOCH_STORAGE_KEY, '1');
    handleProjectionEpochStorageEvent({ key: PROJECTION_EPOCH_STORAGE_KEY, newValue: '1' });

    expect(await storage().get(KEY)).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(1);
    // Rows this window writes now carry the shared epoch.
    await storage().set(KEY, { data: 'new context', updatedAt: 2 });
    expect(await storage().get(KEY)).toEqual({ data: 'new context', updatedAt: 2 });
    unsubscribe();
  });

  it('deletes every projection when the new epoch cannot be persisted', async () => {
    await storage().set(KEY, { data: 'previous context', updatedAt: 1 });
    localStorage.setItem('unrelated', 'kept');
    vi.spyOn(localDatabase, 'initialize').mockResolvedValue(undefined);
    const deleteByPrefix = vi.spyOn(localDatabase, 'deleteByPrefix').mockResolvedValue(undefined);
    // e.g. the localStorage quota is exhausted while IndexedDB still works.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    await markProjectionReset();

    // A reload would read the old epoch back, so the rows must be gone instead.
    expect(deleteByPrefix).toHaveBeenCalledWith('query-projections', '');
    resetProjectionEpochCache();
    expect(await storage().get(KEY)).toBeUndefined();
    expect(localStorage.getItem('unrelated')).toBe('kept');
  });

  it('still resolves when localStorage access is denied altogether', async () => {
    vi.spyOn(localDatabase, 'initialize').mockResolvedValue(undefined);
    const deleteByPrefix = vi.spyOn(localDatabase, 'deleteByPrefix').mockResolvedValue(undefined);
    const denied = () => {
      throw new Error('SecurityError');
    };
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'key').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'length', 'get').mockImplementation(denied);

    await expect(markProjectionReset()).resolves.toBeUndefined();
    expect(deleteByPrefix).toHaveBeenCalledWith('query-projections', '');
  });

  it('never hides the replica index, so a purge can still enumerate old rows', async () => {
    const indexKey = { queryKey: REPLICA_INDEX_KEY, scope: 'u1:ws1' };
    await storage().set(indexKey, { data: '["a"]', updatedAt: 1 });

    await markProjectionReset();

    expect(await storage().getStrict(indexKey)).toEqual({ data: '["a"]', updatedAt: 1 });
  });
});
