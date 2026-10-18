import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dataContextReset, followDataContextReset, resetDataContext } from './dataContextReset';
import {
  handleProjectionEpochStorageEvent,
  PROJECTION_EPOCH_STORAGE_KEY,
  resetProjectionEpochCache,
} from './queryProjectionStorage/resetEpoch';

beforeEach(() => {
  localStorage.clear();
  resetProjectionEpochCache();
  vi.spyOn(dataContextReset, 'reload').mockImplementation(() => {});
});

describe('resetDataContext', () => {
  it('retires the persisted projections, then reloads the renderer', async () => {
    await resetDataContext();

    expect(localStorage.getItem(PROJECTION_EPOCH_STORAGE_KEY)).toBe('1');
    expect(dataContextReset.reload).toHaveBeenCalledTimes(1);
  });

  it('reloads this window when another renderer resets the data context', () => {
    const unsubscribe = followDataContextReset();

    // The Desktop main window switched servers; a popup only sees the event.
    handleProjectionEpochStorageEvent({ key: PROJECTION_EPOCH_STORAGE_KEY, newValue: '1' });

    expect(dataContextReset.reload).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
