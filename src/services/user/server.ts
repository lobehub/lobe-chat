import { DeepPartial } from 'utility-types';

import { lambdaClient } from '@/libs/trpc/client';
import { IUserService } from '@/services/user/type';
import { UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';

export class ServerService implements IUserService {
  getUserState = async (): Promise<UserInitializationState> => {
    return lambdaClient.user.getUserState.query();
  };

  async makeUserOnboarded() {
    return lambdaClient.user.makeUserOnboarded.mutate();
  }

  async updatePreference(preference: UserPreference) {
    return lambdaClient.user.updatePreference.mutate(preference);
  }

  updateUserSettings = async (value: DeepPartial<UserSettings>, signal?: AbortSignal) => {
    return lambdaClient.user.updateSettings.mutate(value, { signal });
  };

  resetUserSettings = async () => {
    return lambdaClient.user.resetSettings.mutate();
  };
}
