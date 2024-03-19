import { act, renderHook, waitFor } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { globalService } from '@/services/global';
import { userService } from '@/services/user';
import { useGlobalStore } from '@/store/global';
import { GlobalServerConfig } from '@/types/settings';
import { switchLang } from '@/utils/switchLang';

vi.mock('zustand/traditional');

vi.mock('@/utils/switchLang', () => ({
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
});
