// @vitest-environment node
import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserModel } from '@/database/models/user';
import { UserItem } from '@/database/schemas';
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
      const data = await response.json();
      expect(data).toEqual({ message: 'user updated', success: true });
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
      expect(data).toEqual({ message: 'user updated', success: true });
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
});
