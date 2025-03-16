// @vitest-environment node
import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';

import { UserModel, UserNotFoundError } from '@/database/server/models/user';

describe('UserNotFoundError', () => {
  it('should extend TRPCError with correct code and message', () => {
    const error = new UserNotFoundError();

    expect(error).toBeInstanceOf(TRPCError);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('user not found');
  });
});

describe('UserModel', () => {
  const mockDb = {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  };

  const mockUserId = 'test-user-id';
  const userModel = new UserModel(mockDb as any, mockUserId);

  describe('getUserRegistrationDuration', () => {
    it('should return default values when user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await userModel.getUserRegistrationDuration();

      expect(result).toEqual({
        createdAt: expect.any(String),
        duration: 1,
        updatedAt: expect.any(String),
      });
    });

    it('should calculate duration correctly for existing user', async () => {
      const createdAt = new Date('2024-01-01');
      mockDb.query.users.findFirst.mockResolvedValue({
        createdAt,
      });

      const result = await userModel.getUserRegistrationDuration();

      expect(result).toEqual({
        createdAt: '2024-01-01',
        duration: expect.any(Number),
        updatedAt: expect.any(String),
      });
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});
