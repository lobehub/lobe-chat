import { trpcClient } from '@/services/_auth/trpc';
import { IUserService } from '@/services/user/type';

export class ServerService implements IUserService {
  getUserRegistrationDuration: IUserService['getUserRegistrationDuration'] = async () => {
    return trpcClient.user.getUserRegistrationDuration.query();
  };

  getUserState: IUserService['getUserState'] = async () => {
    return trpcClient.user.getUserState.query();
  };

  getUserSSOProviders: IUserService['getUserSSOProviders'] = async () => {
    return trpcClient.user.getUserSSOProviders.query();
  };

  unlinkSSOProvider: IUserService['unlinkSSOProvider'] = async (
    provider: string,
    providerAccountId: string,
  ) => {
    return trpcClient.user.unlinkSSOProvider.mutate({ provider, providerAccountId });
  };

  makeUserOnboarded = async () => {
    return trpcClient.user.makeUserOnboarded.mutate();
  };

  updateAvatar: IUserService['updateAvatar'] = async (avatar) => {
    return trpcClient.user.updateAvatar.mutate(avatar);
  };

  updatePreference: IUserService['updatePreference'] = async (preference) => {
    return trpcClient.user.updatePreference.mutate(preference);
  };

  updateGuide: IUserService['updateGuide'] = async (guide) => {
    return trpcClient.user.updateGuide.mutate(guide);
  };

  updateUserSettings: IUserService['updateUserSettings'] = async (value, signal) => {
    return trpcClient.user.updateSettings.mutate(value, { signal });
  };

  resetUserSettings: IUserService['resetUserSettings'] = async () => {
    return trpcClient.user.resetSettings.mutate();
  };
}
