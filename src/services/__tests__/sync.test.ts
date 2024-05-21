import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { dataSync } from '@/database/client/core';
import { StartDataSyncParams } from '@/types/sync';

import { syncService } from '../sync';

vi.mock('@/database/client/core', () => ({
  dataSync: {
    startDataSync: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe('SyncService', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('enabledSync', () => {
    it('should return false when running on server side', async () => {
      const params = { user: { id: '123' }, authToken: 'abc' } as unknown as StartDataSyncParams;

      const origin = global.window;

      // @ts-ignore
      global.window = undefined;

      const result = await syncService.enabledSync(params);

      expect(result).toBe(false);
      expect(dataSync.startDataSync).not.toHaveBeenCalled();

      // reset
      global.window = origin;
    });

    it('should start data sync and return true when running on client side', async () => {
      const params = { user: { id: '123' }, authToken: 'abc' } as unknown as StartDataSyncParams;

      const result = await syncService.enabledSync(params);

      expect(result).toBe(true);
      expect(dataSync.startDataSync).toHaveBeenCalledWith(params);
    });
  });

  describe('disableSync', () => {
    it('should disconnect data sync and return false', async () => {
      const result = await syncService.disableSync();

      expect(result).toBe(false);
      expect(dataSync.disconnect).toHaveBeenCalled();
    });
  });
});
