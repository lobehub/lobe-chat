import type { AdapterAccount } from 'next-auth/adapters';
import type { PartialDeep } from 'type-fest';

import { lambdaClient } from '@/libs/trpc/client';
import { UserGuide, UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';

export class UserService {
  getUserRegistrationDuration = async (): Promise<{
    createdAt: string;
    duration: number;
    updatedAt: string;
  }> => {
    return lambdaClient.user.getUserRegistrationDuration.query();
  };

  getUserState = async (): Promise<UserInitializationState> => {
    return lambdaClient.user.getUserState.query();
  };

  getUserSSOProviders = async (): Promise<AdapterAccount[]> => {
    return lambdaClient.user.getUserSSOProviders.query();
  };

  unlinkSSOProvider = async (provider: string, providerAccountId: string) => {
    return lambdaClient.user.unlinkSSOProvider.mutate({ provider, providerAccountId });
  };

  makeUserOnboarded = async () => {
    return lambdaClient.user.makeUserOnboarded.mutate();
  };

  updateAvatar = async (avatar: string) => {
    return lambdaClient.user.updateAvatar.mutate(avatar);
  };

  updatePreference = async (preference: Partial<UserPreference>) => {
    return lambdaClient.user.updatePreference.mutate(preference);
  };

  updateGuide = async (guide: Partial<UserGuide>) => {
    return lambdaClient.user.updateGuide.mutate(guide);
  };

  updateUserSettings = async (value: PartialDeep<UserSettings>, signal?: AbortSignal) => {
    return lambdaClient.user.updateSettings.mutate(value, { signal });
  };

  resetUserSettings = async () => {
    return lambdaClient.user.resetSettings.mutate();
  };
}

export const userService = new UserService();
