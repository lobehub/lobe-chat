import { DeepPartial } from 'utility-types';

import { UserModel } from '@/database/models/user';
import { GlobalSettings } from '@/types/settings';

export interface UserConfig {
  avatar?: string;
  // settings: JSONPatch
  settings: DeepPartial<GlobalSettings>;
}

class UserService {
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

export const userService = new UserService();
