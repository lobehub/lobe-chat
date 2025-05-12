// @vitest-environment node
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserModel } from '@/database/models/user';
import { UserItem, nextauthAccounts, nextauthSessions } from '@/database/schemas';
import { serverDB } from '@/database/server';
import { pino } from '@/libs/logger';

import { NextAuthUserService } from './index';

vi.mock('@/libs/logger', () => ({
  pino: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/database/models/user');
vi.mock('@/database/server');

describe('NextAuthUserService', () => {
  let service: NextAuthUserService;

  beforeEach(async () => {
    vi.clearAllMocks();
    service = new NextAuthUserService();
  });

  describe('safeUpdateUser', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    const mockAccount = {
      provider: 'github',
      providerAccountId: '12345',
    };

    const mockUpdateData: Partial<UserItem> = {
      avatar: 'https://example.com/avatar.jpg',
      email: 'new@example.com',
      fullName: 'Test User',
    };

    it('should update user when user is found', async () => {
      const mockUserModel = {
        updateUser: vi.fn().mockResolvedValue({}),
      };

      vi.mocked(UserModel).mockImplementation(() => mockUserModel as any);

      // Mock the adapter directly on the service instance
      service.adapter = {
        getUserByAccount: vi.fn().mockResolvedValue(mockUser),
      };

      const response = await service.safeUpdateUser(mockAccount, mockUpdateData);

      expect(pino.info).toHaveBeenCalledWith(
        `updating user "${JSON.stringify(mockAccount)}" due to webhook`,
      );

      expect(service.adapter.getUserByAccount).toHaveBeenCalledWith(mockAccount);
      expect(UserModel).toHaveBeenCalledWith(serverDB, mockUser.id);
      expect(mockUserModel.updateUser).toHaveBeenCalledWith(mockUpdateData);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it('should handle case when user is not found', async () => {
      // Mock the adapter directly on the service instance
      service.adapter = {
        getUserByAccount: vi.fn().mockResolvedValue(null),
      };

      const response = await service.safeUpdateUser(mockAccount, mockUpdateData);

      expect(pino.warn).toHaveBeenCalledWith(
        `[${mockAccount.provider}]: Webhooks handler user "${JSON.stringify(mockAccount)}" update for "${JSON.stringify(mockUpdateData)}", but no user was found by the providerAccountId.`,
      );

      expect(UserModel).not.toHaveBeenCalled();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      const data = await response.json();
    });

    it('should handle errors during user update', async () => {
      const mockError = new Error('Database error');

      // Mock the adapter directly on the service instance
      service.adapter = {
        getUserByAccount: vi.fn().mockRejectedValue(mockError),
      };

      await expect(service.safeUpdateUser(mockAccount, mockUpdateData)).rejects.toThrow(mockError);

      expect(UserModel).not.toHaveBeenCalled();
    });
  });

  describe('safeDeleteSession', () => {
    const mockAccount = {
      userId: 'uid',
    };
    const mockReq = { provider: 'gh', providerAccountId: '12345' };
    it('should delete session when user is found', async () => {
      service.adapter = {
        getAccount: vi.fn().mockResolvedValue(mockAccount),
      };
      service.serverDB.delete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
      });

      await service.safeDeleteSession(mockReq);
      // Expect to query the account first
      expect(service.adapter.getAccount).toBeCalledWith(
        mockReq.provider,
        mockReq.providerAccountId,
      );
      // Expect to delete the session
      expect(service.serverDB.delete).toBeCalledWith(nextauthSessions);
      // Expect to filter by userId
      expect(service.serverDB.delete(nextauthSessions).where).toBeCalledWith(
        eq(nextauthSessions.userId, mockAccount.userId),
      );
    });

    it('should handle case when user is not found', async () => {
      service.adapter = {
        getAccount: vi.fn().mockResolvedValue(mockAccount),
      };
      service.serverDB.delete = vi.fn().mockResolvedValue({});

      service.adapter.getAccount = vi.fn().mockResolvedValue({});
      service.safeDeleteSession(mockReq);
      expect(service.adapter.getAccount).toBeCalledWith(
        mockReq.provider,
        mockReq.providerAccountId,
      );
      expect(service.serverDB.delete).not.toBeCalledWith(nextauthSessions);
    });
  });

  describe('unlinkSSOProviders', () => {
    const mockAccount = {
      userId: 'uid',
    };
    it('should unlink SSO provider when user is found', async () => {
      service.adapter = {
        getAccount: vi.fn().mockResolvedValue(mockAccount),
        unlinkAccount: vi.fn().mockResolvedValue({}),
      };
      const reqBody = { provider: 'gh', providerAccountId: '12345', userId: 'uid' };
      await service.unlinkSSOProvider({
        provider: 'gh',
        providerAccountId: '12345',
        userId: 'uid',
      });
      // Expect to query the account first
      expect(service.adapter.getAccount).toBeCalledWith(
        reqBody.providerAccountId,
        reqBody.provider,
      );
      // Expect to unlink the account
      expect(service.adapter.unlinkAccount).toBeCalledWith({
        provider: reqBody.provider,
        providerAccountId: reqBody.providerAccountId,
      });
    });

    it('should not unlink SSO provider when user is not found', async () => {
      service.adapter = {
        getAccount: vi.fn().mockResolvedValue({}),
        unlinkAccount: vi.fn().mockResolvedValue({}),
      };
      const reqBody = { provider: 'gh', providerAccountId: '12345', userId: 'uid' };
      try {
        await service.unlinkSSOProvider({
          provider: 'gh',
          providerAccountId: '12345',
          userId: 'uid',
        });
      } catch {}
      // Expect to query the account first
      expect(service.adapter.getAccount).toBeCalledWith(
        reqBody.providerAccountId,
        reqBody.provider,
      );
      expect(service.adapter.unlinkAccount).not.toBeCalled();
    });
  });

  describe('getUserSSOProviders', () => {
    it('should get user SSO providers', async () => {
      service.serverDB.select = vi.fn().mockReturnValue({
        expiresAt: vi.fn().mockReturnThis(),
        provider: vi.fn().mockReturnThis(),
        providerAccountId: vi.fn().mockReturnThis(),
        scope: vi.fn().mockReturnThis(),
        type: vi.fn().mockReturnThis(),
        userId: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      });

      await service.getUserSSOProviders('uid');
      expect(service.serverDB.select).toBeCalledWith({
        expiresAt: nextauthAccounts.expires_at,
        provider: nextauthAccounts.provider,
        providerAccountId: nextauthAccounts.providerAccountId,
        scope: nextauthAccounts.scope,
        type: nextauthAccounts.type,
        userId: nextauthAccounts.userId,
      });
    });
  });

  describe('getUserSSOSessions', () => {
    it('should get user SSO sessions', async () => {
      service.serverDB.select = vi.fn().mockReturnValue({
        expiresAt: vi.fn().mockReturnThis(),
        userId: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      });

      await service.getUserSSOSessions('uid');
      expect(service.serverDB.select).toBeCalledWith({
        expiresAt: nextauthSessions.expires,
        userId: nextauthSessions.userId,
      });
    });
  });

  describe('deleteUserSSOSessions', () => {
    it('should delete user SSO sessions', async () => {
      service.serverDB.delete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
      });

      await service.deleteUserSSOSessions('uid');
      expect(service.serverDB.delete).toBeCalledWith(nextauthSessions);
      expect(service.serverDB.delete(nextauthSessions).where).toBeCalledWith(
        eq(nextauthSessions.userId, 'uid'),
      );
    });
  });
});
