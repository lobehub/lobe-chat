import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ServerConfigStoreProvider } from '@/store/serverConfig/Provider';
import { useUserStore } from '@/store/user';

import { useCategory } from '../features/useCategory';

const wrapper: React.JSXElementConstructor<{ children: React.ReactNode }> = ({ children }) => (
  <ServerConfigStoreProvider>{children}</ServerConfigStoreProvider>
);

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
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

// Mock version constants
vi.mock('@/const/version', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/const/version')>();
  return {
    ...actual,
    isServerMode: false,
  };
});

afterEach(() => {
  enableAuth = true;
  enableClerk = true;
  mockNavigate.mockReset();
});

describe('useCategory', () => {
  it('should return correct items when the user is logged in with authentication', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true });
    });
    enableAuth = true;
    enableClerk = false;

    const { result } = renderHook(() => useCategory(), { wrapper });

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'profile')).toBe(true);
      expect(items.some((item) => item.key === 'setting')).toBe(true);
      expect(items.some((item) => item.key === 'docs')).toBe(true);
      expect(items.some((item) => item.key === 'feedback')).toBe(true);
      expect(items.some((item) => item.key === 'changelog')).toBe(true);
    });
  });

  it('should return correct items when the user is not logged in', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false });
    });
    enableAuth = true;

    const { result } = renderHook(() => useCategory(), { wrapper });

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'profile')).toBe(false);
      expect(items.some((item) => item.key === 'setting')).toBe(false);
      expect(items.some((item) => item.key === 'data')).toBe(false);
      expect(items.some((item) => item.key === 'docs')).toBe(true);
      expect(items.some((item) => item.key === 'feedback')).toBe(true);
      expect(items.some((item) => item.key === 'changelog')).toBe(true);
    });
  });
});
