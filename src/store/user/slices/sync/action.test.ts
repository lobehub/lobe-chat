import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { globalService } from '@/services/global';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/slices/auth/selectors';
import { syncSettingsSelectors } from '@/store/user/slices/settings/selectors';

vi.mock('zustand/traditional');

vi.mock('swr', async (importOriginal) => {
  const modules = await importOriginal();
  return {
    ...(modules as any),
    mutate: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createSyncSlice', () => {
  describe('refreshConnection', () => {
    it('should not call triggerEnableSync when userId is empty', async () => {
      const { result } = renderHook(() => useUserStore());
      const onEvent = vi.fn();

      vi.spyOn(userProfileSelectors, 'userId').mockReturnValueOnce(undefined as any);
      const triggerEnableSyncSpy = vi.spyOn(result.current, 'triggerEnableSync');

      await act(async () => {
        await result.current.refreshConnection(onEvent);
      });

      expect(triggerEnableSyncSpy).not.toHaveBeenCalled();
    });

    it('should call triggerEnableSync when userId exists', async () => {
      const { result } = renderHook(() => useUserStore());
      const onEvent = vi.fn();
      const userId = 'user-id';

      vi.spyOn(userProfileSelectors, 'userId').mockReturnValueOnce(userId);
      const triggerEnableSyncSpy = vi.spyOn(result.current, 'triggerEnableSync');

      await act(async () => {
        await result.current.refreshConnection(onEvent);
      });

      expect(triggerEnableSyncSpy).toHaveBeenCalledWith(userId, onEvent);
    });
  });

  describe('triggerEnableSync', () => {
    it('should return false when sync.channelName is empty', async () => {
      const { result } = renderHook(() => useUserStore());
      const userId = 'user-id';
      const onEvent = vi.fn();

      vi.spyOn(syncSettingsSelectors, 'webrtcConfig').mockReturnValueOnce({
        channelName: '',
        enabled: true,
      });

      const data = await act(async () => {
        return result.current.triggerEnableSync(userId, onEvent);
      });

      expect(data).toBe(false);
    });

    it('should call globalService.enabledSync when sync.channelName exists', async () => {
      const userId = 'user-id';
      const onEvent = vi.fn();
      const channelName = 'channel-name';
      const channelPassword = 'channel-password';
      const deviceName = 'device-name';
      const signaling = 'signaling';

      vi.spyOn(syncSettingsSelectors, 'webrtcConfig').mockReturnValueOnce({
        channelName,
        channelPassword,
        signaling,
        enabled: true,
      });
      vi.spyOn(syncSettingsSelectors, 'deviceName').mockReturnValueOnce(deviceName);
      const enabledSyncSpy = vi.spyOn(globalService, 'enabledSync').mockResolvedValueOnce(true);
      const { result } = renderHook(() => useUserStore());

      const data = await act(async () => {
        return result.current.triggerEnableSync(userId, onEvent);
      });

      expect(enabledSyncSpy).toHaveBeenCalledWith({
        channel: { name: channelName, password: channelPassword },
        onAwarenessChange: expect.any(Function),
        onSyncEvent: onEvent,
        onSyncStatusChange: expect.any(Function),
        signaling,
        user: expect.objectContaining({ id: userId, name: deviceName }),
      });
      expect(data).toBe(true);
    });
  });

  describe('useEnabledSync', () => {
    it('should return false when userId is empty', async () => {
      const { result } = renderHook(() => useUserStore().useEnabledSync(true, undefined, vi.fn()), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(false));
    });

    it('should call globalService.disableSync when userEnableSync is false', async () => {
      const disableSyncSpy = vi.spyOn(globalService, 'disableSync').mockResolvedValueOnce(false);

      const { result } = renderHook(
        () => useUserStore().useEnabledSync(false, 'user-id', vi.fn()),
        { wrapper: withSWR },
      );

      await waitFor(() => expect(result.current.data).toBeUndefined());
      expect(disableSyncSpy).toHaveBeenCalled();
    });

    it('should call triggerEnableSync when userEnableSync and userId exist', async () => {
      const userId = 'user-id';
      const onEvent = vi.fn();
      const triggerEnableSyncSpy = vi.fn().mockResolvedValueOnce(true);

      const { result } = renderHook(() => useUserStore());

      // replace triggerEnableSync as a mock
      result.current.triggerEnableSync = triggerEnableSyncSpy;

      const { result: swrResult } = renderHook(
        () => result.current.useEnabledSync(true, userId, onEvent),
        {
          wrapper: withSWR,
        },
      );

      await waitFor(() => expect(swrResult.current.data).toBe(true));
      expect(triggerEnableSyncSpy).toHaveBeenCalledWith(userId, onEvent);
    });
  });
});
