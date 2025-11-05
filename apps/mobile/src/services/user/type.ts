import { UserGuide, UserInitializationState, UserPreference, UserSettings } from '@lobechat/types';
import type { PartialDeep } from 'type-fest';

export interface IUserService {
  getUserRegistrationDuration: () => Promise<{
    createdAt: string;
    duration: number;
    updatedAt: string;
  }>;
  getUserSSOProviders: () => Promise<any>;
  getUserState: () => Promise<UserInitializationState>;
  resetUserSettings: () => Promise<any>;
  unlinkSSOProvider: (provider: string, providerAccountId: string) => Promise<any>;
  updateAvatar: (avatar: string) => Promise<any>;
  updateGuide: (guide: Partial<UserGuide>) => Promise<any>;
  updatePreference: (preference: Partial<UserPreference>) => Promise<any>;
  updateUserSettings: (value: PartialDeep<UserSettings>, signal?: AbortSignal) => Promise<any>;
}
