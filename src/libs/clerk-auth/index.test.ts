import { auth, getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkAuth } from './index';

// 模拟 @clerk/nextjs/server 模块
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  getAuth: vi.fn(),
}));

// 模拟 process.env
const originalEnv = { ...process.env };

beforeEach(() => {
  // 重置所有模拟
  vi.resetAllMocks();

  // 重置环境变量
  process.env = { ...originalEnv };
  Object.assign(process.env, { NODE_ENV: 'development' });
});

afterEach(() => {
  // 恢复环境变量
  process.env = originalEnv;
});

describe('ClerkAuth', () => {
  describe('constructor', () => {
    it('should parse user ID mapping from environment variable', () => {
      process.env.CLERK_DEV_IMPERSONATE_USER = 'dev_user=prod_user';
      const clerkAuth = new ClerkAuth();

      // 使用私有属性测试，需要使用类型断言
      expect(clerkAuth['devUserId']).toBe('dev_user');
      expect(clerkAuth['prodUserId']).toBe('prod_user');
    });

    it('should handle empty mapping string', () => {
      process.env.CLERK_DEV_IMPERSONATE_USER = '';
      const clerkAuth = new ClerkAuth();

      expect((clerkAuth as any).devUserId).toBeNull();
      expect((clerkAuth as any).prodUserId).toBeNull();
    });

    it('should handle invalid mapping format', () => {
      process.env.CLERK_DEV_IMPERSONATE_USER = 'invalid_format';
      const clerkAuth = new ClerkAuth();

      expect((clerkAuth as any).devUserId).toBeNull();
      expect((clerkAuth as any).prodUserId).toBeNull();
    });

    it('should handle undefined mapping', () => {
      delete process.env.CLERK_DEV_IMPERSONATE_USER;
      const clerkAuth = new ClerkAuth();

      expect((clerkAuth as any).devUserId).toBeNull();
      expect((clerkAuth as any).prodUserId).toBeNull();
    });
  });

  describe('getAuthFromRequest', () => {
    it('should get auth from request and return original user ID when no mapping', () => {
      // 设置模拟返回值
      vi.mocked(getAuth).mockReturnValue({ userId: 'original_user_id' } as any);

      const clerkAuth = new ClerkAuth();
      const mockRequest = {} as NextRequest;
      const result = clerkAuth.getAuthFromRequest(mockRequest);

      expect(getAuth).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual({
        clerkAuth: { userId: 'original_user_id' },
        userId: 'original_user_id',
      });
    });

    it('should map user ID in development environment', () => {
      // 设置环境和模拟
      process.env.CLERK_DEV_IMPERSONATE_USER = 'dev_user=prod_user';
      Object.assign(process.env, { NODE_ENV: 'development' });
      vi.mocked(getAuth).mockReturnValue({ userId: 'dev_user' } as any);

      const clerkAuth = new ClerkAuth();
      const result = clerkAuth.getAuthFromRequest({} as NextRequest);

      expect(result).toEqual({
        clerkAuth: { userId: 'dev_user' },
        userId: 'prod_user',
      });
    });

    it('should not map user ID in production environment', () => {
      // 设置环境和模拟
      process.env.CLERK_DEV_IMPERSONATE_USER = 'dev_user=prod_user';
      Object.assign(process.env, { NODE_ENV: 'production' });

      vi.mocked(getAuth).mockReturnValue({ userId: 'dev_user' } as any);

      const clerkAuth = new ClerkAuth();
      const result = clerkAuth.getAuthFromRequest({} as NextRequest);

      expect(result).toEqual({
        clerkAuth: { userId: 'dev_user' },
        userId: 'dev_user',
      });
    });

    it('should handle null user ID', () => {
      vi.mocked(getAuth).mockReturnValue({ userId: null } as any);

      const clerkAuth = new ClerkAuth();
      const result = clerkAuth.getAuthFromRequest({} as NextRequest);

      expect(result).toEqual({
        clerkAuth: { userId: null },
        userId: null,
      });
    });
  });

  describe('getAuth', () => {
    it('should get auth and return original user ID when no mapping', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'original_user_id' } as any);

      const clerkAuth = new ClerkAuth();
      const result = await clerkAuth.getAuth();

      expect(auth).toHaveBeenCalled();
      expect(result).toEqual({
        clerkAuth: { userId: 'original_user_id' },
        userId: 'original_user_id',
      });
    });

    it('should map user ID in development environment', async () => {
      process.env.CLERK_DEV_IMPERSONATE_USER = 'dev_user=prod_user';
      Object.assign(process.env, { NODE_ENV: 'development' });
      vi.mocked(auth).mockResolvedValue({ userId: 'dev_user' } as any);

      const clerkAuth = new ClerkAuth();
      const result = await clerkAuth.getAuth();

      expect(result).toEqual({
        clerkAuth: { userId: 'dev_user' },
        userId: 'prod_user',
      });
    });

    it('should not map user ID in production environment', async () => {
      process.env.CLERK_DEV_IMPERSONATE_USER = 'dev_user=prod_user';
      Object.assign(process.env, { NODE_ENV: 'production' });
      vi.mocked(auth).mockResolvedValue({ userId: 'dev_user' } as any);

      const clerkAuth = new ClerkAuth();
      const result = await clerkAuth.getAuth();

      expect(result).toEqual({
        clerkAuth: { userId: 'dev_user' },
        userId: 'dev_user',
      });
    });

    it('should handle null user ID', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const clerkAuth = new ClerkAuth();
      const result = await clerkAuth.getAuth();

      expect(result).toEqual({
        clerkAuth: { userId: null },
        userId: null,
      });
    });
  });

  describe('getMappedUserId', () => {
    it('should return null for null input', () => {
      const clerkAuth = new ClerkAuth();
      const result = (clerkAuth as any).getMappedUserId(null);

      expect(result).toBeNull();
    });

    it('should return original ID when no mapping exists', () => {
      const clerkAuth = new ClerkAuth();
      const result = (clerkAuth as any).getMappedUserId('some_user_id');

      expect(result).toBe('some_user_id');
    });

    it('should return mapped ID when matching dev ID in development', () => {
      process.env.CLERK_DEV_IMPERSONATE_USER = 'dev_user=prod_user';
      Object.assign(process.env, { NODE_ENV: 'development' });

      const clerkAuth = new ClerkAuth();
      const result = (clerkAuth as any).getMappedUserId('dev_user');

      expect(result).toBe('prod_user');
    });

    it('should return original ID when not matching dev ID', () => {
      process.env.CLERK_DEV_IMPERSONATE_USER = 'dev_user=prod_user';
      Object.assign(process.env, { NODE_ENV: 'development' });

      const clerkAuth = new ClerkAuth();
      const result = (clerkAuth as any).getMappedUserId('other_user');

      expect(result).toBe('other_user');
    });
  });
});
