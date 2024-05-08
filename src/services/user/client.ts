import { DeepPartial } from 'utility-types';

import { UserModel } from '@/database/client/models/user';
import { GlobalSettings } from '@/types/settings';

export interface UserConfig {
  avatar?: string;
  settings: DeepPartial<GlobalSettings>;
  uuid: string;
}

export class ClientService {
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
}
