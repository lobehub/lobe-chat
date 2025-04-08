import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserAuth } from '../auth';

// Mock auth constants
let mockEnableClerk = false;
let mockEnableNextAuth = false;

vi.mock('@/const/auth', () => ({
  get enableClerk() {
    return mockEnableClerk;
  },
  get enableNextAuth() {
    return mockEnableNextAuth;
  },
}));

vi.mock('@/libs/clerk-auth', () => ({
  ClerkAuth: class {
    async getAuth() {
      return {
        clerkAuth: {
          redirectToSignIn: vi.fn(),
        },
        userId: 'clerk-user-id',
      };
    }
  },
}));

vi.mock('@/libs/next-auth/edge', () => ({
  default: {
    auth: vi.fn().mockResolvedValue({
      user: {
        id: 'next-auth-user-id',
      },
    }),
  },
}));

describe('getUserAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnableClerk = false;
    mockEnableNextAuth = false;
  });

  it('should throw error when no auth method is enabled', async () => {
    await expect(getUserAuth()).rejects.toThrow('Auth method is not enabled');
  });

  it('should return clerk auth when clerk is enabled', async () => {
    mockEnableClerk = true;
    mockEnableNextAuth = false;

    const auth = await getUserAuth();

    expect(auth).toEqual({
      clerkAuth: {
        redirectToSignIn: expect.any(Function),
      },
      userId: 'clerk-user-id',
    });
  });

  it('should return next auth when next auth is enabled', async () => {
    mockEnableClerk = false;
    mockEnableNextAuth = true;

    const auth = await getUserAuth();

    expect(auth).toEqual({
      nextAuth: {
        user: {
          id: 'next-auth-user-id',
        },
      },
      userId: 'next-auth-user-id',
    });
  });

  it('should prioritize clerk auth over next auth when both are enabled', async () => {
    mockEnableClerk = true;
    mockEnableNextAuth = true;

    const auth = await getUserAuth();

    expect(auth).toEqual({
      clerkAuth: {
        redirectToSignIn: expect.any(Function),
      },
      userId: 'clerk-user-id',
    });
  });
});
