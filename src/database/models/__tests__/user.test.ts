import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GlobalSettings } from '@/types/settings';

import { UserModel } from '../user';

describe('UserModel', () => {
  let userData: any;

  beforeEach(() => {
    // Set up user data with the correct structure
    userData = {
      uuid: 'user1',
      settings: {},
      avatar: 'avatar.png',
    };
  });

  afterEach(async () => {
    // Clean up the database after each test
    await UserModel.clear();
  });

  it('should create a user record', async () => {
    const result = await UserModel.create(userData);

    expect(result).toEqual(1);
    // Verify that the user has been added to the database
    const userInDb = await UserModel.getUser();

    expect(userInDb).toEqual(
      expect.objectContaining({
        uuid: userData.uuid,
        settings: userData.settings,
        avatar: userData.avatar,
      }),
    );
  });

  it('should update a user record', async () => {
    const result = await UserModel.create(userData);

    const newAvatar = 'new_avatar.png';
    await UserModel.updateAvatar(newAvatar);

    const userInDb = await UserModel.getUser();

    expect(userInDb).toHaveProperty('avatar', newAvatar);
  });

  it('should update user settings', async () => {
    await UserModel.create(userData);

    await UserModel.updateSettings({ themeMode: 'dark' });

    const userInDb = await UserModel.getUser();

    expect(userInDb).toHaveProperty('settings', { themeMode: 'dark' });
  });

  it('should reset user settings', async () => {
    await UserModel.create(userData);

    await UserModel.updateSettings({ themeMode: 'dark' });

    await UserModel.resetSettings();

    const userInDb = await UserModel.getUser();

    expect(userInDb.settings).toBeUndefined();
  });

  it('should clear the user table', async () => {
    await UserModel.create(userData);

    await UserModel.clear();

    const userInDb = await UserModel.table.count();

    expect(userInDb).toEqual(0);
  });
});
