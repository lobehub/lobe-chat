import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enableClerk, enableNextAuth } from '@/const/auth';
import { ClerkAuth } from '@/libs/clerk-auth';
import NextAuthEdge from '@/libs/next-auth/edge';

import { getUserAuth } from '../auth';

// Mock const/auth module
vi.mock('@/const/auth');

// Mock ClerkAuth
vi.mock('@/libs/clerk-auth', () => ({
  ClerkAuth: class {
    async getAuth() {
      return {
        clerkAuth: {},
        userId: 'clerk-user-id',
      };
    }
  },
}));

// Mock NextAuthEdge
vi.mock('@/libs/next-auth/edge', () => ({
  default: {
    auth: vi.fn(),
  },
}));

describe('getUserAuth', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.mocked(NextAuthEdge.auth).mockReset();
  });

  it('should throw error when no auth method enabled', async () => {
    (enableClerk as any) = false;
    (enableNextAuth as any) = false;

    await expect(getUserAuth()).rejects.toThrow('Auth method is not enabled');
  });

  it('should return clerk auth when clerk is enabled', async () => {
    (enableClerk as any) = true;
    (enableNextAuth as any) = false;

    const auth = await getUserAuth();

    expect(auth).toEqual({
      clerkAuth: {},
      userId: 'clerk-user-id',
    });
  });

  it('should return next auth when next auth is enabled', async () => {
    (enableClerk as any) = false;
    (enableNextAuth as any) = true;

    const mockSession = {
      user: {
        id: 'next-auth-user-id',
      },
    };

    vi.mocked(NextAuthEdge.auth).mockResolvedValue(mockSession as any);

    const auth = await getUserAuth();

    expect(auth).toEqual({
      nextAuth: mockSession,
      userId: 'next-auth-user-id',
    });
  });

  it('should handle null next auth session', async () => {
    (enableClerk as any) = false;
    (enableNextAuth as any) = true;

    vi.mocked(NextAuthEdge.auth).mockResolvedValue(null as any);

    const auth = await getUserAuth();

    expect(auth).toEqual({
      nextAuth: null,
      userId: undefined,
    });
  });
});
