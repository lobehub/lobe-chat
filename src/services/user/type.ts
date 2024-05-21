import { DeepPartial } from 'utility-types';

import { UserConfig } from '@/services/user/client';
import { GlobalSettings } from '@/types/settings';
import { UserPreference } from '@/types/user';

export interface IUserService {
  getPreference: () => Promise<UserPreference>;
  getUserConfig: () => Promise<UserConfig>;
  resetUserSettings: () => Promise<any>;
  updateAvatar: (avatar: string) => Promise<any>;
  updatePreference: (preference: UserPreference) => Promise<any>;
  updateUserSettings: (patch: DeepPartial<GlobalSettings>) => Promise<any>;
}
