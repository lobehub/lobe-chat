import { DeepPartial } from 'utility-types';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserModel } from '@/database/client/models/user';
import { UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';
import { AsyncLocalStorage } from '@/utils/localStorage';

import { ClientService } from './client';

vi.mock('@/database/client/models/user', () => ({
  UserModel: {
    getUser: vi.fn(),
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    updateAvatar: vi.fn(),
  },
}));

const mockUser = {
  avatar: 'avatar.png',
  settings: { themeMode: 'light' } as unknown as UserSettings,
  uuid: 'user-id',
};

const mockPreference = {
  useCmdEnterToSend: true,
} as UserPreference;

describe('ClientService', () => {
  let clientService: ClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    clientService = new ClientService();
  });

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
    (UserModel.updateAvatar as Mock).mockResolvedValue(undefined);

    await clientService.updateAvatar(newAvatar);

    expect(UserModel.updateAvatar).toHaveBeenCalledWith(newAvatar);
    expect(UserModel.updateAvatar).toHaveBeenCalledTimes(1);
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
