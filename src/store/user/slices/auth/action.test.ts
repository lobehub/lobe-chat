import { act, renderHook, waitFor } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { userService } from '@/services/user';
import { useUserStore } from '@/store/user';
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

// 定义一个变量来存储 enableAuth 的值
let enableClerk = false;

let enableNextAuth = false;

// 模拟 @/const/auth 模块
vi.mock('@/const/auth', () => ({
  get enableClerk() {
    return enableClerk;
  },
  get enableNextAuth() {
    return enableNextAuth;
  },
}));

afterEach(() => {
  vi.restoreAllMocks();

  enableNextAuth = false;
  enableClerk = false;
});

/**
 * Mock nextauth 库相关方法
 */
vi.mock('next-auth/react', async () => {
  return {
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
});

describe('createAuthSlice', () => {
  describe('refreshUserConfig', () => {
    it('should refresh user config', async () => {
      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.refreshUserConfig();
      });

      expect(mutate).toHaveBeenCalledWith(['fetchUserConfig', true]);
    });
  });

  describe('useFetchUserConfig', () => {
    it('should not fetch user config if initServer is false', async () => {
      const mockUserConfig: any = undefined; // 模拟未初始化服务器的情况
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(mockUserConfig);

      const { result } = renderHook(() => useUserStore().useFetchUserConfig(false), {
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

      const { result } = renderHook(() => useUserStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toEqual(mockUserConfig));

      // 验证状态是否正确更新
      expect(useUserStore.getState().avatar).toBe(mockUserConfig.avatar);
      expect(useUserStore.getState().settings).toEqual(mockUserConfig.settings);

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

      const { result } = renderHook(() => useUserStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toEqual(mockUserConfig));

      // 验证状态是否正确更新
      expect(useUserStore.getState().avatar).toBe(mockUserConfig.avatar);
      expect(useUserStore.getState().settings).toEqual(mockUserConfig.settings);

      // 验证是否正确处理了语言设置
      expect(switchLang).toHaveBeenCalledWith('auto');
    });

    it('should handle the case when user config is null', async () => {
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useUserStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // 等待 SWR 完成数据获取
      await waitFor(() => expect(result.current.data).toBeNull());

      // 验证状态未被错误更新
      expect(useUserStore.getState().avatar).toBeUndefined();
      expect(useUserStore.getState().settings).toEqual({});
    });
  });

  describe('logout', () => {
    it('should call clerkSignOut when Clerk is enabled', async () => {
      enableClerk = true;

      const clerkSignOutMock = vi.fn();
      useUserStore.setState({ clerkSignOut: clerkSignOutMock });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.logout();
      });

      expect(clerkSignOutMock).toHaveBeenCalled();
    });

    it('should not call clerkSignOut when Clerk is disabled', async () => {
      const clerkSignOutMock = vi.fn();
      useUserStore.setState({ clerkSignOut: clerkSignOutMock });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.logout();
      });

      expect(clerkSignOutMock).not.toHaveBeenCalled();
    });

    it('should call next-auth signOut when NextAuth is enabled', async () => {
      useUserStore.setState({ enabledNextAuth: () => true });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.logout();
      });

      const { signOut } = await import('next-auth/react');

      expect(signOut).toHaveBeenCalled();
    });

    it('should not call next-auth signOut when NextAuth is disabled', async () => {
      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.logout();
      });

      const { signOut } = await import('next-auth/react');

      expect(signOut).not.toHaveBeenCalled();
    });
  });

  describe('openLogin', () => {
    it('should call clerkSignIn when Clerk is enabled', async () => {
      enableClerk = true;
      const clerkSignInMock = vi.fn();
      useUserStore.setState({ clerkSignIn: clerkSignInMock });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.openLogin();
      });

      expect(clerkSignInMock).toHaveBeenCalled();
    });
    it('should not call clerkSignIn when Clerk is disabled', async () => {
      const clerkSignInMock = vi.fn();
      useUserStore.setState({ clerkSignIn: clerkSignInMock });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.openLogin();
      });

      expect(clerkSignInMock).not.toHaveBeenCalled();
    });

    it('should call next-auth signIn when NextAuth is enabled', async () => {
      useUserStore.setState({ enabledNextAuth: () => true });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.openLogin();
      });

      const { signIn } = await import('next-auth/react');

      expect(signIn).toHaveBeenCalled();
    });
    it('should not call next-auth signIn when NextAuth is disabled', async () => {
      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.openLogin();
      });

      const { signIn } = await import('next-auth/react');

      expect(signIn).not.toHaveBeenCalled();
    });
  });

  describe('openUserProfile', () => {
    it('should call clerkOpenUserProfile when Clerk is enabled', async () => {
      enableClerk = true;

      const clerkOpenUserProfileMock = vi.fn();
      useUserStore.setState({ clerkOpenUserProfile: clerkOpenUserProfileMock });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.openUserProfile();
      });

      expect(clerkOpenUserProfileMock).toHaveBeenCalled();
    });
    it('should not call clerkOpenUserProfile when Clerk is disabled', async () => {
      const clerkOpenUserProfileMock = vi.fn();
      useUserStore.setState({ clerkOpenUserProfile: clerkOpenUserProfileMock });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.openUserProfile();
      });

      expect(clerkOpenUserProfileMock).not.toHaveBeenCalled();
    });
  });
});
