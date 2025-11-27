import { act, renderHook } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/user';

vi.mock('zustand/traditional');

vi.mock('swr', async (importOriginal) => {
  const modules = await importOriginal();
  return {
    ...(modules as any),
    mutate: vi.fn(),
  };
});

// Use vi.hoisted to ensure variables exist before vi.mock factory executes
const { enableClerk, enableNextAuth, enableBetterAuth } = vi.hoisted(() => ({
  enableClerk: { value: false },
  enableNextAuth: { value: false },
  enableBetterAuth: { value: false },
}));

vi.mock('@/const/auth', () => ({
  get enableClerk() {
    return enableClerk.value;
  },
  get enableNextAuth() {
    return enableNextAuth.value;
  },
  get enableBetterAuth() {
    return enableBetterAuth.value;
  },
}));

afterEach(() => {
  vi.restoreAllMocks();

  enableNextAuth.value = false;
  enableClerk.value = false;
  enableBetterAuth.value = false;
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
  describe('refreshUserState', () => {
    it('should refresh user config', async () => {
      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.refreshUserState();
      });

      expect(mutate).toHaveBeenCalledWith('initUserState');
    });
  });

  describe('logout', () => {
    it('should call clerkSignOut when Clerk is enabled', async () => {
      enableClerk.value = true;

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
      enableNextAuth.value = true;

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.logout();
      });

      const { signOut } = await import('next-auth/react');

      expect(signOut).toHaveBeenCalled();
      enableNextAuth.value = false;
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
      enableClerk.value = true;
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
      enableNextAuth.value = true;

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.openLogin();
      });

      const { signIn } = await import('next-auth/react');

      expect(signIn).toHaveBeenCalled();
      enableNextAuth.value = false;
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
});
