import { subscribeWithSelector } from 'zustand/middleware';
import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { TokenStorage } from '@/mobile/services/_auth/tokenStorage';
import { OAuthService } from '@/mobile/services/_auth/authService';
import { getAuthConfig } from '@/mobile/config/auth';
import type { AuthState, User, Token } from '@/mobile/types/user';
import { authLogger } from '@/mobile/utils/logger';

interface UserStore extends AuthState {
  // 认证服务实例
  authService: OAuthService;

  // 清除状态
  clearAuthState: () => void;
  getUserInfo: () => Promise<User>;
  // 初始化和恢复
  initialize: () => Promise<void>;
  // 工具方法
  isAccessTokenExpired: () => Promise<boolean>;

  isInitialized: boolean;
  isRefreshTokenExpired: () => Promise<boolean>;
  // 基础操作
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  restoreAuthState: () => Promise<void>;
  setAuthenticated: (authenticated: boolean) => void;

  setError: (error: string | null) => void;
  // 状态管理
  setLoading: (loading: boolean) => void;
  setToken: (token: Token | null) => void;

  setUser: (user: User | null) => void;
}

export const useUserStore = createWithEqualityFn<UserStore>()(
  subscribeWithSelector((set, get) => ({
    // 认证服务实例
    authService: new OAuthService(getAuthConfig()),

    // 清除认证状态
    clearAuthState: () => {
      set({
        error: null,
        isAuthenticated: false,
        isLoading: false,
        token: null,
        user: null,
      });
    },

    error: null,

    // 获取用户信息
    getUserInfo: async () => {
      const { authService } = get();
      return await authService.getUserInfo();
    },

    // 初始化
    initialize: async () => {
      const { setLoading, restoreAuthState, isInitialized } = get();

      // 防止重复初始化
      if (isInitialized) {
        return;
      }

      try {
        setLoading(true);
        await restoreAuthState();
        set({ isInitialized: true });
      } catch (error) {
        authLogger.error('Failed to initialize auth state:', error);
        get().clearAuthState();
        set({ isInitialized: true });
      } finally {
        setLoading(false);
      }
    },

    // 检查访问令牌是否过期
    isAccessTokenExpired: async () => {
      return await TokenStorage.isAccessTokenExpired();
    },

    // 初始状态
    isAuthenticated: false,

    isInitialized: false,

    isLoading: false,

    // 检查刷新令牌是否过期
    isRefreshTokenExpired: async () => {
      return await TokenStorage.isRefreshTokenExpired();
    },

    // 登录
    login: async () => {
      const { authService, setLoading, setError, setUser, setToken, setAuthenticated } = get();

      try {
        setLoading(true);
        setError(null);

        // 执行登录
        await authService.login();

        // 获取存储的用户数据和令牌
        const [userData, tokenData] = await Promise.all([
          TokenStorage.getUserData(),
          TokenStorage.getToken(),
        ]);

        if (userData && tokenData) {
          setUser(userData);
          setToken(tokenData);
          setAuthenticated(true);
        } else {
          throw new Error('Failed to retrieve user data after login');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        setError(errorMessage);
        setAuthenticated(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 登出
    logout: async () => {
      const { authService, setLoading, setError, clearAuthState } = get();

      try {
        setLoading(true);
        setError(null);

        // 执行登出
        await authService.logout();

        // 清除本地状态
        clearAuthState();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Logout failed';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 刷新令牌
    refreshToken: async () => {
      const { authService, setError, setToken } = get();

      try {
        setError(null);

        // 检查是否需要刷新
        const isExpired = await get().isAccessTokenExpired();
        const isRefreshExpired = await get().isRefreshTokenExpired();

        if (isRefreshExpired) {
          // 刷新令牌已过期，需要重新登录
          await get().logout();
          throw new Error('Refresh token expired, please login again');
        }

        if (isExpired) {
          // 刷新访问令牌
          const newToken = await authService.refreshToken();
          setToken(newToken);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
        setError(errorMessage);
        throw error;
      }
    },

    // 恢复认证状态
    restoreAuthState: async () => {
      const { setUser, setToken, setAuthenticated, setError } = get();

      try {
        setError(null);

        // 检查是否有有效的令牌
        const hasValidToken = await TokenStorage.hasValidToken();
        if (!hasValidToken) {
          return;
        }

        // 获取存储的数据
        const [userData, tokenData] = await Promise.all([
          TokenStorage.getUserData(),
          TokenStorage.getToken(),
        ]);

        if (userData && tokenData) {
          setUser(userData);
          setToken(tokenData);
          setAuthenticated(true);

          // 检查是否需要刷新令牌
          const isExpired = await get().isAccessTokenExpired();
          if (isExpired) {
            await get().refreshToken();
          }
        }
      } catch (error) {
        authLogger.error('Failed to restore auth state:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to restore auth state';
        setError(errorMessage);
      }
    },

    // 设置认证状态
    setAuthenticated: (authenticated: boolean) => {
      set({ isAuthenticated: authenticated });
    },

    // 设置错误状态
    setError: (error: string | null) => {
      set({ error });
    },

    // 设置加载状态
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    // 设置令牌
    setToken: (token: Token | null) => {
      set({ token });
    },

    // 设置用户信息
    setUser: (user: User | null) => {
      set({ user });
    },

    token: null,

    user: null,
  })),
  shallow,
);

// 注意：不要在模块级别自动初始化，这会导致React渲染时的无限循环
// 初始化需要在组件中手动触发

// 监听认证状态变化
useUserStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      authLogger.info('User authenticated successfully');
    } else {
      authLogger.info('User logged out');
    }
  },
);

// 监听错误状态
useUserStore.subscribe(
  (state) => state.error,
  (error) => {
    if (error) {
      console.error('Auth error:', error);
    }
  },
);

// 导出 store 的选择器 - 使用 useMemo 稳定返回的对象
export const useAuth = () => {
  const error = useUserStore((state) => state.error);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isInitialized = useUserStore((state) => state.isInitialized);
  const isLoading = useUserStore((state) => state.isLoading);
  const user = useUserStore((state) => state.user);

  return useMemo(
    () => ({
      error,
      isAuthenticated,
      isInitialized,
      isLoading,
      user,
    }),
    [error, isAuthenticated, isInitialized, isLoading, user],
  );
};

export const useAuthActions = () => {
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);
  const refreshToken = useUserStore((state) => state.refreshToken);

  return useMemo(
    () => ({
      login,
      logout,
      refreshToken,
    }),
    [login, logout, refreshToken],
  );
};
