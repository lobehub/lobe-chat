import type { AdapterAccount } from 'next-auth/adapters';
import type { PartialDeep } from 'type-fest';

import { UserGuide, UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';

export interface IUserService {
  getUserRegistrationDuration: () => Promise<{
    createdAt: string;
    duration: number;
    updatedAt: string;
  }>;
  getUserSSOProviders: () => Promise<AdapterAccount[]>;
  getUserState: () => Promise<UserInitializationState>;
  resetUserSettings: () => Promise<any>;
  unlinkSSOProvider: (provider: string, providerAccountId: string) => Promise<any>;
  updateAvatar: (avatar: string) => Promise<any>;
  updateGuide: (guide: Partial<UserGuide>) => Promise<any>;
  updatePreference: (preference: Partial<UserPreference>) => Promise<any>;
  updateUserSettings: (value: PartialDeep<UserSettings>, signal?: AbortSignal) => Promise<any>;
}
