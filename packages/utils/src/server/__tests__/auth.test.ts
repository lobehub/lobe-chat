import { beforeEach, describe, expect, it, vi } from 'vitest';

import { extractBearerToken, getUserAuth } from '../auth';

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

vi.mock('@/libs/next-auth', () => ({
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

describe('extractBearerToken', () => {
  it('should return the token when authHeader is valid', () => {
    const token = 'test-token';
    const authHeader = `Bearer ${token}`;
    expect(extractBearerToken(authHeader)).toBe(token);
  });

  it('should return null when authHeader is missing', () => {
    expect(extractBearerToken()).toBeNull();
  });

  it('should return null when authHeader is null', () => {
    expect(extractBearerToken(null)).toBeNull();
  });

  it('should return null when authHeader does not start with "Bearer "', () => {
    const authHeader = 'Invalid format';
    expect(extractBearerToken(authHeader)).toBeNull();
  });

  it('should return null when authHeader is only "Bearer"', () => {
    const authHeader = 'Bearer';
    expect(extractBearerToken(authHeader)).toBeNull();
  });

  it('should return null when authHeader is an empty string', () => {
    const authHeader = '';
    expect(extractBearerToken(authHeader)).toBeNull();
  });

  it('should handle extra spaces correctly', () => {
    const token = 'test-token-with-spaces';
    const authHeaderWithExtraSpaces = ` Bearer   ${token}  `;
    const authHeaderLeadingSpace = ` Bearer ${token}`;
    const authHeaderTrailingSpace = `Bearer ${token} `;
    const authHeaderMultipleSpacesBetween = `Bearer    ${token}`;

    expect(extractBearerToken(authHeaderWithExtraSpaces)).toBe(token);
    expect(extractBearerToken(authHeaderLeadingSpace)).toBe(token);
    expect(extractBearerToken(authHeaderTrailingSpace)).toBe(token);
    expect(extractBearerToken(authHeaderMultipleSpacesBetween)).toBe(token);
  });
});
