import { DeepPartial } from 'utility-types';

import { UserModel } from '@/database/client/models/user';
import { IUserService } from '@/services/user/type';
import { GlobalSettings } from '@/types/settings';
import { UserPreference } from '@/types/user';
import { AsyncLocalStorage } from '@/utils/localStorage';

export interface UserConfig {
  avatar?: string;
  settings: DeepPartial<GlobalSettings>;
  uuid: string;
}

export class ClientService implements IUserService {
  private preferenceStorage: AsyncLocalStorage<UserPreference>;
  constructor() {
    this.preferenceStorage = new AsyncLocalStorage('LOBE_PREFERENCE');
  }

  getUserConfig = async () => {
    const user = await UserModel.getUser();
    return user as unknown as UserConfig;
  };

  updateUserSettings = async (patch: DeepPartial<GlobalSettings>) => {
    return UserModel.updateSettings(patch);
  };

  resetUserSettings = async () => {
    return UserModel.resetSettings();
  };

  updateAvatar(avatar: string) {
    return UserModel.updateAvatar(avatar);
  }

  async getPreference() {
    return this.preferenceStorage.getFromLocalStorage();
  }

  async updatePreference(preference: UserPreference) {
    await this.preferenceStorage.saveToLocalStorage(preference);
  }
}
