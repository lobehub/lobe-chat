import { DeepPartial } from 'utility-types';

import { UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';

export interface IUserService {
  getUserState: () => Promise<UserInitializationState>;
  resetUserSettings: () => Promise<any>;
  updatePreference: (preference: UserPreference) => Promise<any>;
  updateUserSettings: (patch: DeepPartial<UserSettings>) => Promise<any>;
}
