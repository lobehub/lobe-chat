import { DeepPartial } from 'utility-types';

import { GlobalSettings } from '@/types/settings';
import { UserInitializationState, UserPreference } from '@/types/user';

export interface IUserService {
  getUserState: () => Promise<UserInitializationState>;
  resetUserSettings: () => Promise<any>;
  updatePreference: (preference: UserPreference) => Promise<any>;
  updateUserSettings: (patch: DeepPartial<GlobalSettings>) => Promise<any>;
}
