import { DeepPartial } from 'utility-types';

import { lambdaClient } from '@/libs/trpc/client';
import { IUserService } from '@/services/user/type';
import { UserGuide, UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';

export class ServerService implements IUserService {
  getUserState = async (): Promise<UserInitializationState> => {
    return lambdaClient.user.getUserState.query();
  };

  async makeUserOnboarded() {
    return lambdaClient.user.makeUserOnboarded.mutate();
  }

  async updatePreference(preference: Partial<UserPreference>) {
    return lambdaClient.user.updatePreference.mutate(preference);
  }

  async updateGuide(guide: Partial<UserGuide>) {
    return lambdaClient.user.updateGuide.mutate(guide);
  }

  updateUserSettings = async (value: DeepPartial<UserSettings>, signal?: AbortSignal) => {
    return lambdaClient.user.updateSettings.mutate(value, { signal });
  };

  resetUserSettings = async () => {
    return lambdaClient.user.resetSettings.mutate();
  };
}
