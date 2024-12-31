import { eq } from 'drizzle-orm/expressions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { getTestDBInstance } from '@/database/server/core/dbForTest';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { UserGuide, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';

import { UserSettingsItem, userSettings, users } from '../../../schemas';
import { SessionModel } from '../session';
import { UserModel } from '../user';

let serverDB = await getTestDBInstance();

const userId = 'user-db';
const userEmail = 'user@example.com';
const userModel = new UserModel(serverDB, userId);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.delete(userSettings);
  process.env.KEY_VAULTS_SECRET = 'ofQiJCXLF8mYemwfMWLOHoHimlPu91YmLfU7YZ4lreQ=';
});

afterEach(async () => {
  await serverDB.delete(users);
  await serverDB.delete(userSettings);
  process.env.KEY_VAULTS_SECRET = undefined;
});

describe('UserModel', () => {
  describe('createUser', () => {
    it('should create a new user and inbox session', async () => {
      const params = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
      };

      await UserModel.createUser(serverDB, params);

      const user = await serverDB.query.users.findFirst({ where: eq(users.id, userId) });
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
      expect(user?.email).toBe('test@example.com');

      const sessionModel = new SessionModel(serverDB, userId);
      const inbox = await sessionModel.findByIdOrSlug(INBOX_SESSION_ID);
      expect(inbox).not.toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      await serverDB.insert(users).values({ id: userId });

      await UserModel.deleteUser(serverDB, userId);

      const user = await serverDB.query.users.findFirst({ where: eq(users.id, userId) });
      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      await serverDB.insert(users).values({ id: userId, username: 'testuser' });

      const user = await UserModel.findById(serverDB, userId);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(userId);
      expect(user?.username).toBe('testuser');
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      await serverDB.insert(users).values({ id: userId, email: userEmail });

      const user = await UserModel.findByEmail(serverDB, userEmail);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(userId);
      expect(user?.email).toBe(userEmail);
    });
  });

  describe('getUserState', () => {
    it('should get user state with decrypted keyVaults', async () => {
      const preference = { useCmdEnterToSend: true } as UserPreference;
      const keyVaults = { apiKey: 'secret' };

      await serverDB.insert(users).values({ id: userId, preference });

      const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
      const encryptedKeyVaults = await gateKeeper.encrypt(JSON.stringify(keyVaults));

      await serverDB.insert(userSettings).values({
        id: userId,
        keyVaults: encryptedKeyVaults,
      });

      const state = await userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);

      expect(state.userId).toBe(userId);
      expect(state.preference).toEqual(preference);
      expect(state.settings.keyVaults).toEqual(keyVaults);
    });

    it('should throw an error if user not found', async () => {
      const userModel = new UserModel(serverDB, 'invalid-user-id');

      await expect(userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults)).rejects.toThrow(
        'user not found',
      );
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      await serverDB.insert(users).values({ id: userId, username: 'oldname' });

      await userModel.updateUser({ username: 'newname' });

      const updatedUser = await serverDB.query.users.findFirst({
        where: eq(users.id, userId),
      });
      expect(updatedUser?.username).toBe('newname');
    });
  });

  describe('getUserSettings', () => {
    it('should get user settings', async () => {
      await serverDB.insert(users).values({ id: userId });
      await serverDB.insert(userSettings).values({ id: userId, general: { language: 'en-US' } });

      const data = await userModel.getUserSettings();

      expect(data).toMatchObject({ id: userId, general: { language: 'en-US' } });
    });
  });

  describe('deleteSetting', () => {
    it('should delete user settings', async () => {
      await serverDB.insert(users).values({ id: userId });
      await serverDB.insert(userSettings).values({ id: userId });

      await userModel.deleteSetting();

      const settings = await serverDB.query.userSettings.findFirst({
        where: eq(users.id, userId),
      });

      expect(settings).toBeUndefined();
    });
  });

  describe('updateSetting', () => {
    it('should update user settings with new item', async () => {
      const settings = {
        general: { language: 'en-US' },
      } as UserSettingsItem;
      await serverDB.insert(users).values({ id: userId });

      await userModel.updateSetting(settings);

      const updatedSettings = await serverDB.query.userSettings.findFirst({
        where: eq(users.id, userId),
      });
      expect(updatedSettings?.general).toEqual(settings.general);
    });

    it('should update user settings with exist item', async () => {
      const settings = {
        general: { language: 'en-US' },
      } as UserSettingsItem;
      await serverDB.insert(users).values({ id: userId });
      await serverDB.insert(userSettings).values({ ...settings, keyVaults: '', id: userId });

      const newSettings = {
        general: { fontSize: 16, language: 'zh-CN', themeMode: 'dark' },
      } as UserSettingsItem;
      await userModel.updateSetting(newSettings);

      const updatedSettings = await serverDB.query.userSettings.findFirst({
        where: eq(users.id, userId),
      });
      expect(updatedSettings?.general).toEqual(newSettings.general);
    });
  });

  describe('updatePreference', () => {
    it('should update user preference', async () => {
      const preference = { guide: { topic: false } } as UserPreference;
      await serverDB.insert(users).values({ id: userId, preference });

      const newPreference: Partial<UserPreference> = {
        guide: { topic: true, moveSettingsToAvatar: true },
      };
      await userModel.updatePreference(newPreference);

      const updatedUser = await serverDB.query.users.findFirst({ where: eq(users.id, userId) });
      expect(updatedUser?.preference).toEqual({ ...preference, ...newPreference });
    });
  });

  describe('updateGuide', () => {
    it('should update user guide', async () => {
      const preference = { guide: { topic: false } } as UserGuide;
      await serverDB.insert(users).values({ id: userId, preference });

      const newGuide: Partial<UserGuide> = {
        topic: true,
        moveSettingsToAvatar: true,
        uploadFileInKnowledgeBase: true,
      };
      await userModel.updateGuide(newGuide);

      const updatedUser = await serverDB.query.users.findFirst({ where: eq(users.id, userId) });
      expect(updatedUser?.preference).toEqual({ ...preference, guide: newGuide });
    });
  });

  describe('getUserApiKeys', () => {
    it('should get and decrypt user API keys', async () => {
      const keyVaults = { openai: { apiKey: 'test-key' } };
      const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
      const encryptedKeyVaults = await gateKeeper.encrypt(JSON.stringify(keyVaults));

      const userId = 'user-api-id';

      await serverDB.insert(users).values({ id: userId });
      await serverDB.insert(userSettings).values({
        id: userId,
        keyVaults: encryptedKeyVaults,
      });

      const result = await UserModel.getUserApiKeys(
        serverDB,
        userId,
        KeyVaultsGateKeeper.getUserKeyVaults,
      );
      expect(result).toEqual(keyVaults);
    });

    it('should throw error when user not found', async () => {
      await expect(
        UserModel.getUserApiKeys(serverDB, 'non-existent-id', KeyVaultsGateKeeper.getUserKeyVaults),
      ).rejects.toThrow('user not found');
    });

    it('should handle decrypt failure and return empty object', async () => {
      const userId = 'user-api-test-id';
      // 模拟解密失败的情况
      const invalidEncryptedData = 'invalid:-encrypted-:data';
      await serverDB.insert(users).values({ id: userId });
      await serverDB.insert(userSettings).values({
        id: userId,
        keyVaults: invalidEncryptedData,
      });

      const result = await UserModel.getUserApiKeys(
        serverDB,
        userId,
        KeyVaultsGateKeeper.getUserKeyVaults,
      );
      expect(result).toEqual({});
    });
  });
});
