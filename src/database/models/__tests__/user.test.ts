import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserModel, UserNotFoundError } from '../user';

const mockDb = {
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue({}),
  }),
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockResolvedValue({}),
      onConflictDoUpdate: vi.fn().mockResolvedValue({}),
      returning: vi.fn().mockResolvedValue([{ id: 'new-user' }]),
    }),
  }),
  query: {
    users: {
      findFirst: vi.fn(),
    },
    userSettings: {
      findFirst: vi.fn(),
    },
  },
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        leftJoin: vi.fn(),
      }),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue({}),
    }),
  }),
};

const TEST_USER_ID = 'test-user-id';

describe('UserModel', () => {
  let userModel: UserModel;

  beforeEach(() => {
    userModel = new UserModel(mockDb as any, TEST_USER_ID);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserRegistrationDuration', () => {
    it('should return default duration for new user', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await userModel.getUserRegistrationDuration();

      expect(result).toEqual({
        createdAt: expect.any(String),
        duration: 1,
        updatedAt: expect.any(String),
      });
    });

    it('should calculate duration for existing user', async () => {
      const createdAt = new Date('2024-01-01');
      mockDb.query.users.findFirst.mockResolvedValue({ createdAt });

      const result = await userModel.getUserRegistrationDuration();

      expect(result).toEqual({
        createdAt: '2024-01-01',
        duration: expect.any(Number),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('getUserState', () => {
    const mockDecryptor = vi.fn();

    it('should throw UserNotFoundError when user not found', async () => {
      mockDb.select().from().where().leftJoin.mockResolvedValue([]);

      await expect(userModel.getUserState(mockDecryptor)).rejects.toThrow(UserNotFoundError);
    });

    it('should return user state with decrypted key vaults', async () => {
      const mockUserState = {
        avatar: 'avatar.jpg',
        email: 'test@test.com',
        firstName: 'John',
        fullName: 'John Doe',
        isOnboarded: true,
        lastName: 'Doe',
        preference: { telemetry: true },
        settingsDefaultAgent: {},
        settingsGeneral: {},
        settingsHotkey: {},
        settingsKeyVaults: 'encrypted',
        settingsLanguageModel: {},
        settingsSystemAgent: {},
        settingsTTS: {},
        settingsTool: {},
        username: 'johndoe',
      };

      mockDb.select().from().where().leftJoin.mockResolvedValue([mockUserState]);
      mockDecryptor.mockResolvedValue({ decrypted: true });

      const result = await userModel.getUserState(mockDecryptor);

      expect(result).toEqual({
        avatar: 'avatar.jpg',
        email: 'test@test.com',
        firstName: 'John',
        fullName: 'John Doe',
        isOnboarded: true,
        lastName: 'Doe',
        preference: { telemetry: true },
        settings: {
          defaultAgent: {},
          general: {},
          hotkey: {},
          keyVaults: { decrypted: true },
          languageModel: {},
          systemAgent: {},
          tool: {},
          tts: {},
        },
        userId: TEST_USER_ID,
        username: 'johndoe',
      });
    });
  });

  describe('static methods', () => {
    it('should create user if not exists', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await UserModel.createUser(mockDb as any, { id: 'new-user' });

      expect(result).toEqual({
        duplicate: false,
        user: { id: 'new-user' },
      });
    });

    it('should return duplicate true if user exists', async () => {
      mockDb.query.users.findFirst.mockResolvedValue({ id: 'existing-user' });

      const result = await UserModel.createUser(mockDb as any, { id: 'existing-user' });

      expect(result).toEqual({
        duplicate: true,
      });
    });

    it('should find user by id', async () => {
      const mockUser = { id: TEST_USER_ID };
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await UserModel.findById(mockDb as any, TEST_USER_ID);

      expect(result).toEqual(mockUser);
    });

    it('should find user by email', async () => {
      const mockUser = { email: 'test@test.com' };
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await UserModel.findByEmail(mockDb as any, 'test@test.com');

      expect(result).toEqual(mockUser);
    });

    it('should get user API keys', async () => {
      const mockDecryptor = vi.fn().mockResolvedValue({ key: 'decrypted' });
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ settingsKeyVaults: 'encrypted' }]),
        }),
      });

      const result = await UserModel.getUserApiKeys(mockDb as any, TEST_USER_ID, mockDecryptor);

      expect(result).toEqual({ key: 'decrypted' });
    });

    it('should throw UserNotFoundError when getting API keys for non-existent user', async () => {
      const mockDecryptor = vi.fn();
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        UserModel.getUserApiKeys(mockDb as any, TEST_USER_ID, mockDecryptor),
      ).rejects.toThrow(UserNotFoundError);
    });
  });
});
