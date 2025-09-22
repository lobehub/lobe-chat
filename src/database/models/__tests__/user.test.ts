import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserModel, UserNotFoundError } from '../user';

const mockDb = {
  delete: vi.fn().mockReturnValue({
    where: vi.fn(),
  }),
  insert: vi.fn(),
  query: {
    users: {
      findFirst: vi.fn(),
    },
    userSettings: {
      findFirst: vi.fn(),
    },
  },
  select: vi.fn(),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn(),
    }),
  }),
};

const mockUserId = 'test-user-id';
const mockUser = {
  id: mockUserId,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  preference: {},
};

describe('UserModel', () => {
  let userModel: UserModel;

  beforeEach(() => {
    vi.clearAllMocks();
    userModel = new UserModel(mockDb as any, mockUserId);
  });

  describe('getUserRegistrationDuration', () => {
    it('should return registration duration when user exists', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await userModel.getUserRegistrationDuration();

      expect(result).toEqual({
        createdAt: '2025-01-01',
        duration: expect.any(Number),
        updatedAt: expect.any(String),
      });
    });

    it('should return default values when user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await userModel.getUserRegistrationDuration();

      expect(result).toEqual({
        createdAt: expect.any(String),
        duration: 1,
        updatedAt: expect.any(String),
      });
    });
  });

  describe('getUserState', () => {
    const mockDecryptor = vi.fn();
    const mockUserState = {
      avatar: 'avatar.jpg',
      email: 'test@test.com',
      firstName: 'Test',
      fullName: 'Test User',
      isOnboarded: true,
      lastName: 'User',
      preference: {},
      settingsDefaultAgent: {},
      settingsGeneral: {},
      settingsHotkey: {},
      settingsKeyVaults: 'encrypted',
      settingsLanguageModel: {},
      settingsSystemAgent: {},
      settingsTTS: {},
      settingsTool: {},
      username: 'testuser',
    };

    it('should return user state when user exists', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockResolvedValue([mockUserState]),
          }),
        }),
      });

      mockDecryptor.mockResolvedValue({});

      const result = await userModel.getUserState(mockDecryptor);

      expect(result).toEqual({
        avatar: 'avatar.jpg',
        email: 'test@test.com',
        firstName: 'Test',
        fullName: 'Test User',
        isOnboarded: true,
        lastName: 'User',
        preference: {},
        settings: expect.any(Object),
        userId: mockUserId,
        username: 'testuser',
      });
    });

    it('should throw UserNotFoundError when user not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(userModel.getUserState(mockDecryptor)).rejects.toThrow(UserNotFoundError);
    });

    it('should handle decryption error gracefully', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockResolvedValue([mockUserState]),
          }),
        }),
      });

      mockDecryptor.mockRejectedValue(new Error('Decryption failed'));

      const result = await userModel.getUserState(mockDecryptor);
      expect(result.settings.keyVaults).toEqual({});
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updateData = { firstName: 'New Name' };
      await userModel.updateUser(updateData);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.update().set).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('updatePreference', () => {
    it('should update user preference', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      const preference = { telemetry: true };

      await userModel.updatePreference(preference);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.update().set).toHaveBeenCalled();
    });

    it('should not update if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await userModel.updatePreference({});

      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('static methods', () => {
    it('createUser should create new user', async () => {
      const newUser = { id: 'new-user' };
      mockDb.query.users.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newUser]),
        }),
      });

      const result = await UserModel.createUser(mockDb as any, newUser);

      expect(result).toEqual({ duplicate: false, user: newUser });
    });

    it('should handle duplicate user creation', async () => {
      const existingUser = { id: 'existing-user' };
      mockDb.query.users.findFirst.mockResolvedValue(existingUser);

      const result = await UserModel.createUser(mockDb as any, { id: 'existing-user' });

      expect(result).toEqual({ duplicate: true });
    });

    it('findById should find user by id', async () => {
      await UserModel.findById(mockDb as any, mockUserId);

      expect(mockDb.query.users.findFirst).toHaveBeenCalled();
    });

    it('deleteUser should delete user', async () => {
      await UserModel.deleteUser(mockDb as any, mockUserId);

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe('getUserSSOProviders', () => {
    it('should get user SSO providers', async () => {
      const mockProviders = [{ provider: 'google', providerAccountId: '123' }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockProviders),
        }),
      });

      const result = await userModel.getUserSSOProviders();
      expect(result).toEqual(mockProviders);
    });
  });

  describe('updateGuide', () => {
    it('should update user guide preferences', async () => {
      const mockExistingUser = {
        ...mockUser,
        preference: { guide: { topic: true } },
      };

      mockDb.query.users.findFirst.mockResolvedValue(mockExistingUser);

      const guideUpdate = { moveSettingsToAvatar: true };
      await userModel.updateGuide(guideUpdate);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.update().set).toHaveBeenCalledWith({
        preference: {
          guide: { topic: true, moveSettingsToAvatar: true },
        },
      });
    });

    it('should not update if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await userModel.updateGuide({});

      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });
});
