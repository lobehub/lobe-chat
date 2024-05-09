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

describe('useCategory', () => {
  it('should return correct items when the user is logged in with authentication', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true });
    });
    enableAuth = true;
    enableClerk = false;

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
    enableAuth = true;
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

  it('should return correct items when the user is not logged in', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false });
    });
    enableAuth = true;

    const { result } = renderHook(() => useCategory());

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'profile')).toBe(false);
      expect(items.some((item) => item.key === 'setting')).toBe(false);
      expect(items.some((item) => item.key === 'data')).toBe(false);
      expect(items.some((item) => item.key === 'docs')).toBe(true);
      expect(items.some((item) => item.key === 'feedback')).toBe(true);
      expect(items.some((item) => item.key === 'discord')).toBe(true);
    });
  });

  it('should handle settings for non-authenticated users', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false });
    });
    enableAuth = false;

    const { result } = renderHook(() => useCategory());

    act(() => {
      const items = result.current;
      expect(items.some((item) => item.key === 'extraSetting')).toBe(true);
    });
  });
});
