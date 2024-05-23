import { DeepPartial } from 'utility-types';

import { MessageModel } from '@/database/client/models/message';
import { UserModel } from '@/database/client/models/user';
import { GlobalSettings } from '@/types/settings';
import { UserInitializationState, UserPreference } from '@/types/user';
import { AsyncLocalStorage } from '@/utils/localStorage';

import { IUserService } from './type';

export class ClientService implements IUserService {
  private preferenceStorage: AsyncLocalStorage<UserPreference>;

  constructor() {
    this.preferenceStorage = new AsyncLocalStorage('LOBE_PREFERENCE');
  }

  async getUserState(): Promise<UserInitializationState> {
    const user = await UserModel.getUser();
    const messageCount = await MessageModel.count();

    return {
      avatar: user.avatar,
      canEnableTrace: messageCount >= 4,
      isOnboard: true,
      preference: await this.preferenceStorage.getFromLocalStorage(),
      settings: user.settings as GlobalSettings,
      userId: user.uuid,
    };
  }

  updateUserSettings = async (patch: DeepPartial<GlobalSettings>) => {
    return UserModel.updateSettings(patch);
  };

  resetUserSettings = async () => {
    return UserModel.resetSettings();
  };

  updateAvatar(avatar: string) {
    return UserModel.updateAvatar(avatar);
  }

  async updatePreference(preference: UserPreference) {
    await this.preferenceStorage.saveToLocalStorage(preference);
  }
}
