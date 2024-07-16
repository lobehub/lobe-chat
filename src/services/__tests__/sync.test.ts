import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { liveblocksDataSync, webrtcDataSync } from '@/database/client/core';
import { StartDataSyncParams, SyncMethod } from '@/types/sync';

import { syncService } from '../sync';

vi.mock('@/database/client/core', () => ({
  liveblocksDataSync: {
    startDataSync: vi.fn(),
    disconnect: vi.fn(),
  },
  webrtcDataSync: {
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
      expect(liveblocksDataSync.startDataSync).not.toHaveBeenCalled();
      expect(webrtcDataSync.startDataSync).not.toHaveBeenCalled();

      // reset
      global.window = origin;
    });

    it('should start data sync and return true when running on client side', async () => {
      const params = {
        user: { id: '123' },
        channel: {
          liveblocks: {
            enabled: true,
            name: 'test',
          },
          webrtc: {
            enabled: true,
            password: 'channel-password',
            name: 'test',
          },
        },
      } as unknown as StartDataSyncParams;

      const result = await syncService.enabledSync(params);

      expect(result).toBe(true);
      expect(liveblocksDataSync.startDataSync).toHaveBeenCalledWith(
        params.user,
        params.channel.liveblocks,
      );
      expect(webrtcDataSync.startDataSync).toHaveBeenCalledWith(params.user, params.channel.webrtc);
    });
  });

  describe('disableSync', () => {
    it('should disconnect data sync and return false', async () => {
      const result = await syncService.disableSync({
        webrtc: false,
        liveblocks: false,
      });

      expect(result).toBe(false);
      expect(liveblocksDataSync.disconnect).toHaveBeenCalled();
      expect(webrtcDataSync.disconnect).toHaveBeenCalled();
    });
  });
});
