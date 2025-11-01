import { isDesktop } from '@/const/version';
import { lambdaClient } from '@/libs/trpc/client';
import { IUserService } from '@/services/user/type';
import { userClientService } from '@/services/user';

export class DesktopUserService implements IUserService {
    getUserRegistrationDuration: IUserService['getUserRegistrationDuration'] = async () => {
        return lambdaClient.user.getUserRegistrationDuration.query();
    };

    getUserState: IUserService['getUserState'] = async () => {
        return lambdaClient.user.getUserState.query();
    };

    getUserSSOProviders: IUserService['getUserSSOProviders'] = async () => {
        return lambdaClient.user.getUserSSOProviders.query();
    };

    unlinkSSOProvider: IUserService['unlinkSSOProvider'] = async (
        provider: string,
        providerAccountId: string,
    ) => {
        return lambdaClient.user.unlinkSSOProvider.mutate({ provider, providerAccountId });
    };

    makeUserOnboarded = async () => {
        return lambdaClient.user.makeUserOnboarded.mutate();
    };

    updateAvatar: IUserService['updateAvatar'] = async (avatar) => {
        const { getElectronStoreState } = await import('@/store/electron');
        const { electronSyncSelectors } = await import('@/store/electron/selectors');

        try {
            const state = getElectronStoreState();
            const isSyncActive = electronSyncSelectors.isSyncActive(state);

            if (!isSyncActive) {
                return userClientService.updateAvatar(avatar);
            }
        } catch {
            return userClientService.updateAvatar(avatar);
        }

        return lambdaClient.user.updateAvatar.mutate(avatar);
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
