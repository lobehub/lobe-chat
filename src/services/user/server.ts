import { lambdaClient } from '@/libs/trpc/client';
import { IUserService } from '@/services/user/type';

export class ServerService implements IUserService {
  getUserRegistrationDuration: IUserService['getUserRegistrationDuration'] = async () => {
    return lambdaClient.user.getUserRegistrationDuration.query();
  };

  getUserState: IUserService['getUserState'] = async () => {
    return lambdaClient.user.getUserState.query();
  };

  makeUserOnboarded = async () => {
    return lambdaClient.user.makeUserOnboarded.mutate();
  };

  updatePreference: IUserService['updatePreference'] = async (preference) => {
    return lambdaClient.user.updatePreference.mutate(preference);
  };

  updateGuide: IUserService['updateGuide'] = async (guide) => {
    return lambdaClient.user.updateGuide.mutate(guide);
  };

  updateUserSettings: IUserService['updateUserSettings'] = async (value, signal) => {
    return lambdaClient.user.updateSettings.mutate(value, { signal });
  };

  resetUserSettings: IUserService['resetUserSettings'] = async () => {
    return lambdaClient.user.resetSettings.mutate();
  };
}
