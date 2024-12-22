import { act, renderHook, waitFor } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { DEFAULT_PREFERENCE } from '@/const/user';
import { userService } from '@/services/user';
import { ClientService } from '@/services/user/_deprecated';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { GlobalServerConfig } from '@/types/serverConfig';
import { UserInitializationState, UserPreference } from '@/types/user';
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
  describe('updateAvatar', () => {
    it('should update avatar', async () => {
      const { result } = renderHook(() => useUserStore());
      const avatar = 'new-avatar';

      const spyOn = vi.spyOn(result.current, 'refreshUserState');
      const updateAvatarSpy = vi
        .spyOn(ClientService.prototype, 'updateAvatar')
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.updateAvatar(avatar);
      });

      expect(updateAvatarSpy).toHaveBeenCalledWith(avatar);
      expect(spyOn).toHaveBeenCalled();
    });
  });

  describe('useInitUserState', () => {
    const mockServerConfig = {
      defaultAgent: 'agent1',
      languageModel: 'model1',
      telemetry: {},
    } as GlobalServerConfig;

    it('should not fetch user state if user is not login', async () => {
      const mockUserConfig: any = undefined; // 模拟未初始化服务器的情况
      vi.spyOn(userService, 'getUserState').mockResolvedValueOnce(mockUserConfig);
      const successCallback = vi.fn();

      const { result } = renderHook(
        () =>
          useUserStore().useInitUserState(false, mockServerConfig, {
            onSuccess: successCallback,
          }),
        { wrapper: withSWR },
      );

      // 因为 initServer 为 false，所以不会触发 getUserState 的调用
      expect(userService.getUserState).not.toHaveBeenCalled();
      // 也不会触发 onSuccess 回调
      expect(successCallback).not.toHaveBeenCalled();
      // 确保状态未改变
      expect(result.current.data).toBeUndefined();
    });

    it('should fetch user state correctly when user is login', async () => {
      const mockUserState: UserInitializationState = {
        userId: 'user-id',
        isOnboard: true,
        preference: {
          telemetry: true,
        },
        settings: {
          general: { language: 'en-US' },
        },
      };

      vi.spyOn(userService, 'getUserState').mockResolvedValueOnce(mockUserState);
      const successCallback = vi.fn();

      const { result } = renderHook(
        () =>
          useUserStore().useInitUserState(true, mockServerConfig, {
            onSuccess: successCallback,
          }),
        {
          wrapper: withSWR,
        },
      );

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toEqual(mockUserState));

      // 验证状态是否正确更新
      expect(useUserStore.getState().user?.avatar).toBe(mockUserState.avatar);
      expect(useUserStore.getState().settings).toEqual(mockUserState.settings);
      expect(successCallback).toHaveBeenCalledWith(mockUserState);

      // 验证是否正确处理了语言设置
      expect(switchLang).not.toHaveBeenCalledWith('auto');
    });

    it('should call switch language when language is auto', async () => {
      const mockUserState: UserInitializationState = {
        userId: 'user-id',
        isOnboard: true,
        preference: {
          telemetry: true,
        },
        settings: {},
      };

      vi.spyOn(userService, 'getUserState').mockResolvedValueOnce(mockUserState);

      const { result } = renderHook(() => useUserStore().useInitUserState(true, mockServerConfig), {
        wrapper: withSWR,
      });

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toEqual(mockUserState));

      // 验证是否正确处理了语言设置
      expect(switchLang).toHaveBeenCalledWith('auto');
    });

    it('should fetch use server config correctly', async () => {
      const mockUserState: UserInitializationState = {
        userId: 'user-id',
        isOnboard: true,
        preference: {
          telemetry: true,
        },
        settings: {},
      };
      vi.spyOn(userService, 'getUserState').mockResolvedValueOnce(mockUserState);

      const { result } = renderHook(() => useUserStore().useInitUserState(true, mockServerConfig));

      await waitFor(() => expect(result.current.data).toEqual(mockUserState));
    });

    it('should return saved preference when local storage has data', async () => {
      const { result } = renderHook(() => useUserStore());

      const savedPreference: UserPreference = {
        ...DEFAULT_PREFERENCE,
        hideSyncAlert: true,
        guide: { topic: false, moveSettingsToAvatar: true },
      };

      const mockUserState: UserInitializationState = {
        userId: 'user-id',
        isOnboard: true,
        preference: savedPreference,
        settings: {
          general: { language: 'en-US' },
        },
      };
      vi.spyOn(userService, 'getUserState').mockResolvedValueOnce(mockUserState);

      const { result: preference } = renderHook(
        () => result.current.useInitUserState(true, mockServerConfig),
        { wrapper: withSWR },
      );

      await waitFor(() => {
        expect(preference.current.data.preference).toEqual(savedPreference);
        expect(result.current.isUserStateInit).toBeTruthy();
        expect(result.current.preference).toEqual(savedPreference);
      });
    });

    it('should handle the case when user state have avatar', async () => {
      const { result } = renderHook(() => useUserStore());
      const mockUserState: UserInitializationState = {
        userId: 'user-id',
        isOnboard: true,
        preference: undefined as any,
        settings: null as any,
        avatar: 'abc',
      };

      vi.spyOn(userService, 'getUserState').mockResolvedValueOnce(mockUserState);

      renderHook(() => result.current.useInitUserState(true, mockServerConfig), {
        wrapper: withSWR,
      });

      //   等待 SWR 完成数据获取
      await waitFor(() => {
        expect(result.current.isUserStateInit).toBeTruthy();
        // 验证状态未被错误更新
        expect(result.current.user?.avatar).toEqual('abc');
        expect(result.current.settings).toEqual({});
      });
    });

    it('should return default preference when local storage is empty', async () => {
      const { result } = renderHook(() => useUserStore());

      const mockUserState: UserInitializationState = {
        userId: 'user-id',
        isOnboard: true,
        preference: {} as any,
        settings: {
          general: { language: 'en-US' },
        },
      };

      vi.spyOn(userService, 'getUserState').mockResolvedValueOnce(mockUserState);

      renderHook(() => result.current.useInitUserState(true, mockServerConfig), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(result.current.isUserStateInit).toBeTruthy();
        expect(result.current.preference).toEqual(DEFAULT_PREFERENCE);
      });
    });
  });

  describe('useCheckTrace', () => {
    it('should return undefined when shouldFetch is false', async () => {
      const { result } = renderHook(() => useUserStore().useCheckTrace(false), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBeUndefined());
    });

    it('should return false when userAllowTrace is already set', async () => {
      vi.spyOn(preferenceSelectors, 'userAllowTrace').mockReturnValueOnce(true);

      const { result } = renderHook(() => useUserStore().useCheckTrace(true), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(false));
    });

    it('should call messageService.messageCountToCheckTrace when needed', async () => {
      vi.spyOn(preferenceSelectors, 'userAllowTrace').mockReturnValueOnce(null);

      act(() => {
        useUserStore.setState({
          isUserCanEnableTrace: true,
        });
      });

      const { result } = renderHook(() => useUserStore.getState().useCheckTrace(true), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(true));
    });
  });
});
