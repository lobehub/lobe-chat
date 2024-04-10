import { act, renderHook, waitFor } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { globalService } from '@/services/global';
import { messageService } from '@/services/message';
import { userService } from '@/services/user';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/slices/common/selectors';
import { preferenceSelectors } from '@/store/global/slices/preference/selectors';
import { syncSettingsSelectors } from '@/store/global/slices/settings/selectors';
import { GlobalServerConfig } from '@/types/serverConfig';
import { switchLang } from '@/utils/client/switchLang';

vi.mock('zustand/traditional');

vi.mock('@/utils/client/switchLang', () => ({
  switchLang: vi.fn(),
}));

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

describe('createCommonSlice', () => {
  describe('switchBackToChat', () => {
    it('should switch back to chat', () => {
      const { result } = renderHook(() => useGlobalStore());
      const sessionId = 'session-id';
      const router = { push: vi.fn() } as any;

      act(() => {
        useGlobalStore.setState({ router });
        result.current.switchBackToChat(sessionId);
      });

      expect(router.push).toHaveBeenCalledWith('/chat?session=session-id');
    });
  });

  describe('refreshUserConfig', () => {
    it('should refresh user config', async () => {
      const { result } = renderHook(() => useGlobalStore());

      await act(async () => {
        await result.current.refreshUserConfig();
      });

      expect(mutate).toHaveBeenCalledWith(['fetchUserConfig', true]);
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const avatar = 'new-avatar';

      const spyOn = vi.spyOn(result.current, 'refreshUserConfig');
      const updateAvatarSpy = vi.spyOn(userService, 'updateAvatar');

      await act(async () => {
        await result.current.updateAvatar(avatar);
      });

      expect(updateAvatarSpy).toHaveBeenCalledWith(avatar);
      expect(spyOn).toHaveBeenCalled();
    });
  });

  describe('useCheckLatestVersion', () => {
    it('should set hasNewVersion to false if there is no new version', async () => {
      const latestVersion = '0.0.1';

      vi.spyOn(globalService, 'getLatestVersion').mockResolvedValueOnce(latestVersion);

      const { result } = renderHook(() => useGlobalStore().useCheckLatestVersion(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(result.current.data).toBe(latestVersion);
      });

      expect(useGlobalStore.getState().hasNewVersion).toBeUndefined();
      expect(useGlobalStore.getState().latestVersion).toBeUndefined();
    });

    it('should set hasNewVersion to true if there is a new version', async () => {
      const latestVersion = '10000000.0.0';

      vi.spyOn(globalService, 'getLatestVersion').mockResolvedValueOnce(latestVersion);

      const { result } = renderHook(() => useGlobalStore().useCheckLatestVersion(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(result.current.data).toBe(latestVersion);
      });

      expect(useGlobalStore.getState().hasNewVersion).toBe(true);
      expect(useGlobalStore.getState().latestVersion).toBe(latestVersion);
    });
  });

  describe('useFetchServerConfig', () => {
    it('should fetch server config correctly', async () => {
      const mockServerConfig = {
        defaultAgent: 'agent1',
        languageModel: 'model1',
        telemetry: {},
      } as GlobalServerConfig;
      vi.spyOn(globalService, 'getGlobalConfig').mockResolvedValueOnce(mockServerConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchServerConfig());

      await waitFor(() => expect(result.current.data).toEqual(mockServerConfig));
    });
  });

  describe('useFetchUserConfig', () => {
    it('should not fetch user config if initServer is false', async () => {
      const mockUserConfig: any = undefined; // 模拟未初始化服务器的情况
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(mockUserConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(false), {
        wrapper: withSWR,
      });

      // 因为 initServer 为 false，所以不会触发 getUserConfig 的调用
      expect(userService.getUserConfig).not.toHaveBeenCalled();
      // 确保状态未改变
      expect(result.current.data).toBeUndefined();
    });

    it('should fetch user config correctly when initServer is true', async () => {
      const mockUserConfig: any = {
        avatar: 'new-avatar-url',
        settings: {
          language: 'en',
        },
      };
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(mockUserConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toEqual(mockUserConfig));

      // 验证状态是否正确更新
      expect(useGlobalStore.getState().avatar).toBe(mockUserConfig.avatar);
      expect(useGlobalStore.getState().settings).toEqual(mockUserConfig.settings);

      // 验证是否正确处理了语言设置
      expect(switchLang).not.toHaveBeenCalledWith('auto');
    });
    it('should call switch language when language is auto', async () => {
      const mockUserConfig: any = {
        avatar: 'new-avatar-url',
        settings: {
          language: 'auto',
        },
      };
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(mockUserConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toEqual(mockUserConfig));

      // 验证状态是否正确更新
      expect(useGlobalStore.getState().avatar).toBe(mockUserConfig.avatar);
      expect(useGlobalStore.getState().settings).toEqual(mockUserConfig.settings);

      // 验证是否正确处理了语言设置
      expect(switchLang).toHaveBeenCalledWith('auto');
    });

    it('should handle the case when user config is null', async () => {
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toBeNull());

      // 验证状态未被错误更新
      expect(useGlobalStore.getState().avatar).toBeUndefined();
      expect(useGlobalStore.getState().settings).toEqual({});
    });
  });

  describe('refreshConnection', () => {
    it('should not call triggerEnableSync when userId is empty', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const onEvent = vi.fn();

      vi.spyOn(commonSelectors, 'userId').mockReturnValueOnce(undefined);
      const triggerEnableSyncSpy = vi.spyOn(result.current, 'triggerEnableSync');

      await act(async () => {
        await result.current.refreshConnection(onEvent);
      });

      expect(triggerEnableSyncSpy).not.toHaveBeenCalled();
    });

    it('should call triggerEnableSync when userId exists', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const onEvent = vi.fn();
      const userId = 'user-id';

      vi.spyOn(commonSelectors, 'userId').mockReturnValueOnce(userId);
      const triggerEnableSyncSpy = vi.spyOn(result.current, 'triggerEnableSync');

      await act(async () => {
        await result.current.refreshConnection(onEvent);
      });

      expect(triggerEnableSyncSpy).toHaveBeenCalledWith(userId, onEvent);
    });
  });

  describe('triggerEnableSync', () => {
    it('should return false when sync.channelName is empty', async () => {
      const { result } = renderHook(() => useGlobalStore());
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
      const { result } = renderHook(() => useGlobalStore());

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

  describe('useCheckTrace', () => {
    it('should return false when shouldFetch is false', async () => {
      const { result } = renderHook(() => useGlobalStore().useCheckTrace(false), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(false));
    });

    it('should return false when userAllowTrace is already set', async () => {
      vi.spyOn(preferenceSelectors, 'userAllowTrace').mockReturnValueOnce(true);

      const { result } = renderHook(() => useGlobalStore().useCheckTrace(true), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(false));
    });

    it('should call messageService.messageCountToCheckTrace when needed', async () => {
      vi.spyOn(preferenceSelectors, 'userAllowTrace').mockReturnValueOnce(null);
      const messageCountToCheckTraceSpy = vi
        .spyOn(messageService, 'messageCountToCheckTrace')
        .mockResolvedValueOnce(true);

      const { result } = renderHook(() => useGlobalStore().useCheckTrace(true), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(true));
      expect(messageCountToCheckTraceSpy).toHaveBeenCalled();
    });
  });

  describe('useEnabledSync', () => {
    it('should return false when userId is empty', async () => {
      const { result } = renderHook(
        () => useGlobalStore().useEnabledSync(true, undefined, vi.fn()),
        { wrapper: withSWR },
      );

      await waitFor(() => expect(result.current.data).toBe(false));
    });

    it('should call globalService.disableSync when userEnableSync is false', async () => {
      const disableSyncSpy = vi.spyOn(globalService, 'disableSync').mockResolvedValueOnce(false);

      const { result } = renderHook(
        () => useGlobalStore().useEnabledSync(false, 'user-id', vi.fn()),
        { wrapper: withSWR },
      );

      await waitFor(() => expect(result.current.data).toBeUndefined());
      expect(disableSyncSpy).toHaveBeenCalled();
    });

    it('should call triggerEnableSync when userEnableSync and userId exist', async () => {
      const userId = 'user-id';
      const onEvent = vi.fn();
      const triggerEnableSyncSpy = vi.fn().mockResolvedValueOnce(true);

      const { result } = renderHook(() => useGlobalStore());

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
