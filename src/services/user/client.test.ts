import { DeepPartial } from 'utility-types';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserModel } from '@/database/_deprecated/models/user';
import { migrate } from '@/database/client/migrate';
import { UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';
import { AsyncLocalStorage } from '@/utils/localStorage';

import { ClientService } from './client';

const mockUser = {
  avatar: 'avatar.png',
  settings: { themeMode: 'light' } as unknown as UserSettings,
  uuid: 'user-id',
};

const mockPreference = {
  useCmdEnterToSend: true,
} as UserPreference;
const clientService = new ClientService('123');

beforeEach(async () => {
  vi.clearAllMocks();

  await migrate();
});

describe('ClientService', () => {
  it('should get user state correctly', async () => {
    (UserModel.getUser as Mock).mockResolvedValue(mockUser);
    const spyOn = vi
      .spyOn(clientService['preferenceStorage'], 'getFromLocalStorage')
      .mockResolvedValue(mockPreference);

    const userState = await clientService.getUserState();

    expect(userState).toEqual({
      avatar: mockUser.avatar,
      isOnboard: true,
      canEnablePWAGuide: false,
      hasConversation: false,
      canEnableTrace: false,
      preference: mockPreference,
      settings: mockUser.settings,
      userId: mockUser.uuid,
    });
    expect(UserModel.getUser).toHaveBeenCalledTimes(1);
    expect(spyOn).toHaveBeenCalledTimes(1);
  });

  it('should update user settings correctly', async () => {
    const settingsPatch: DeepPartial<UserSettings> = { general: { themeMode: 'dark' } };
    (UserModel.updateSettings as Mock).mockResolvedValue(undefined);

    await clientService.updateUserSettings(settingsPatch);

    expect(UserModel.updateSettings).toHaveBeenCalledWith(settingsPatch);
    expect(UserModel.updateSettings).toHaveBeenCalledTimes(1);
  });

  it('should reset user settings correctly', async () => {
    (UserModel.resetSettings as Mock).mockResolvedValue(undefined);

    await clientService.resetUserSettings();

    expect(UserModel.resetSettings).toHaveBeenCalledTimes(1);
  });

  it('should update user avatar correctly', async () => {
    const newAvatar = 'new-avatar.png';

    await clientService.updateAvatar(newAvatar);
  });

  it('should update user preference correctly', async () => {
    const newPreference = {
      useCmdEnterToSend: false,
    } as UserPreference;

    const spyOn = vi
      .spyOn(clientService['preferenceStorage'], 'saveToLocalStorage')
      .mockResolvedValue(undefined);

    await clientService.updatePreference(newPreference);

    expect(spyOn).toHaveBeenCalledWith(newPreference);
    expect(spyOn).toHaveBeenCalledTimes(1);
  });
});
