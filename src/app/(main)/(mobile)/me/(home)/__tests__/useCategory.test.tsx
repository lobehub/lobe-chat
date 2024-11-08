import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/user';

import { useCategory } from '../features/useCategory';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
}));

vi.mock('../../settings/features/useCategory', () => ({
  useCategory: vi.fn(() => [{ key: 'extraSetting', label: 'Extra Setting' }]),
}));

// 定义一个变量来存储 enableAuth 的值
let enableAuth = true;
let enableClerk = false;
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
  enableClerk = false;
});

// 目前对 enableAuth 的判定是在 useUserStore 中，所以需要 mock useUserStore
// 类型定义： enableAuth: () => boolean
describe('useCategory', () => {
  it('should return correct items when the user is logged in with authentication', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true, enableAuth: () => true });
    });

    const { result } = renderHook(() => useCategory());

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'profile')).toBe(false);
      expect(items.some((item) => item.key === 'setting')).toBe(true);
      expect(items.some((item) => item.key === 'data')).toBe(true);
      expect(items.some((item) => item.key === 'docs')).toBe(true);
      expect(items.some((item) => item.key === 'feedback')).toBe(true);
      expect(items.some((item) => item.key === 'discord')).toBe(true);
    });
  });

  it('should return correct items when the user is logged in with Clerk', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true });
    });
    enableClerk = true;

    const { result } = renderHook(() => useCategory());

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'profile')).toBe(true);
      expect(items.some((item) => item.key === 'setting')).toBe(true);
      expect(items.some((item) => item.key === 'data')).toBe(true);
      expect(items.some((item) => item.key === 'docs')).toBe(true);
      expect(items.some((item) => item.key === 'feedback')).toBe(true);
      expect(items.some((item) => item.key === 'discord')).toBe(true);
    });
  });

  it('should return correct items when the user is logged in with NextAuth', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true, enableAuth: () => true, enabledNextAuth: true });
    });

    const { result } = renderHook(() => useCategory());

    act(() => {
      const items = result.current;
      // Should not render profile for NextAuth, it's Clerk only
      expect(items.some((item) => item.key === 'profile')).toBe(false);
      expect(items.some((item) => item.key === 'setting')).toBe(true);
      expect(items.some((item) => item.key === 'data')).toBe(true);
      expect(items.some((item) => item.key === 'docs')).toBe(true);
      expect(items.some((item) => item.key === 'feedback')).toBe(true);
      expect(items.some((item) => item.key === 'discord')).toBe(true);
      expect(items.some((item) => item.key === 'nextauthSignout')).toBe(true);
    });
  });

  it('should return correct items when the user is not logged in', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false, enableAuth: () => true });
    });

    const { result } = renderHook(() => useCategory());

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'profile')).toBe(false);
      expect(items.some((item) => item.key === 'setting')).toBe(false);
      expect(items.some((item) => item.key === 'data')).toBe(false);
      expect(items.some((item) => item.key === 'docs')).toBe(true);
      expect(items.some((item) => item.key === 'feedback')).toBe(true);
      expect(items.some((item) => item.key === 'discord')).toBe(true);
      expect(items.some((item) => item.key === 'nextauthSignout')).toBe(false);
    });
  });

  it('should handle settings for non-authenticated users', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false, enableAuth: () => false });
    });
    enableClerk = false;

    const { result } = renderHook(() => useCategory());

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'extraSetting')).toBe(true);
    });
  });
});
