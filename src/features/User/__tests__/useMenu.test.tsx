import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ServerConfigStoreProvider } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';

import { useMenu } from '../UserPanel/useMenu';

const wrapper: React.JSXElementConstructor<{ children: React.ReactNode }> = ({ children }) => (
  <ServerConfigStoreProvider>{children}</ServerConfigStoreProvider>
);

// Mock dependencies
vi.mock('next/link', () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('@/hooks/useQueryRoute', () => ({
  useQueryRoute: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('@/hooks/useInterceptingRoutes', () => ({
  useOpenSettings: vi.fn(() => vi.fn()),
}));

vi.mock('@/features/DataImporter', () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
}));

vi.mock('@/services/config', () => ({
  configService: {
    exportAgents: vi.fn(),
    exportAll: vi.fn(),
    exportSessions: vi.fn(),
    exportSettings: vi.fn(),
  },
}));

vi.mock('./useNewVersion', () => ({
  useNewVersion: vi.fn(() => false),
}));

// 定义一个变量来存储 enableAuth 的值
let enableAuth = true;
let enableClerk = true;
// 模拟 @/const/auth 模块
vi.mock('@/const/auth', () => ({
  get enableAuth() {
    return enableAuth;
  },
  get enableClerk() {
    return enableClerk;
  },
}));

afterEach(() => {
  enableAuth = true;
  enableClerk = true;
});

describe('useMenu', () => {
  it('should provide correct menu items when user is logged in with auth', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true, enableAuth: () => true });
    });
    enableAuth = true;
    enableClerk = false;

    const { result } = renderHook(() => useMenu(), { wrapper });

    act(() => {
      const { mainItems, logoutItems } = result.current;
      expect(mainItems?.some((item) => item?.key === 'profile')).toBe(false);
      expect(mainItems?.some((item) => item?.key === 'setting')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'import')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'export')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'changelog')).toBe(true);
      expect(logoutItems.some((item) => item?.key === 'logout')).toBe(true);
    });
  });

  it('should provide correct menu items when user is logged in with Clerk', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true });
    });
    enableAuth = true;
    enableClerk = true;

    const { result } = renderHook(() => useMenu(), { wrapper });

    act(() => {
      const { mainItems, logoutItems } = result.current;
      expect(mainItems?.some((item) => item?.key === 'profile')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'setting')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'import')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'export')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'changelog')).toBe(true);
      expect(logoutItems.some((item) => item?.key === 'logout')).toBe(true);
    });
  });

  it('should provide correct menu items when user is logged in without auth', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false, enableAuth: () => false });
    });
    enableAuth = false;

    const { result } = renderHook(() => useMenu(), { wrapper });

    act(() => {
      const { mainItems, logoutItems } = result.current;
      expect(mainItems?.some((item) => item?.key === 'profile')).toBe(false);
      expect(mainItems?.some((item) => item?.key === 'setting')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'import')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'export')).toBe(true);
      expect(mainItems?.some((item) => item?.key === 'changelog')).toBe(true);
      expect(logoutItems.some((item) => item?.key === 'logout')).toBe(false);
    });
  });

  it('should provide correct menu items when user is not logged in', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false, enableAuth: () => true });
    });
    enableAuth = true;

    const { result } = renderHook(() => useMenu(), { wrapper });

    act(() => {
      const { mainItems, logoutItems } = result.current;
      expect(mainItems?.some((item) => item?.key === 'profile')).toBe(false);
      expect(mainItems?.some((item) => item?.key === 'setting')).toBe(false);
      expect(mainItems?.some((item) => item?.key === 'import')).toBe(false);
      expect(mainItems?.some((item) => item?.key === 'export')).toBe(false);
      expect(mainItems?.some((item) => item?.key === 'changelog')).toBe(true);
      expect(logoutItems.some((item) => item?.key === 'logout')).toBe(false);
    });
  });
});
