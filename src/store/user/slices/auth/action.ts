import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { enableClerk } from '@/const/auth';
import { UserConfig, userService } from '@/services/user';
import { switchLang } from '@/utils/client/switchLang';
import { setNamespace } from '@/utils/storeDebug';

import { UserStore } from '../../store';
import { settingsSelectors } from '../settings/selectors';

const n = setNamespace('auth');
const USER_CONFIG_FETCH_KEY = 'fetchUserConfig';

export interface UserAuthAction {
  enableAuth: () => boolean;
  enabledNextAuth: () => boolean;
  getUserConfig: () => void;
  /**
   * universal logout method
   */
  logout: () => Promise<void>;
  /**
   * universal login method
   */
  openLogin: () => Promise<void>;
  openUserProfile: () => Promise<void>;

  refreshUserConfig: () => Promise<void>;
  useFetchUserConfig: (initServer: boolean) => SWRResponse<UserConfig | undefined>;
}

export const createAuthSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  UserAuthAction
> = (set, get) => ({
  enableAuth: () => {
    return enableClerk || get()?.enabledNextAuth();
  },
  enabledNextAuth: () => {
    return !!get()?.serverConfig.enabledOAuthSSO;
  },
  getUserConfig: () => {
    console.log(n('userconfig'));
  },
  logout: async () => {
    if (enableClerk) {
      get().clerkSignOut?.({ redirectUrl: location.toString() });

      return;
    }

    const enableNextAuth = get().enabledNextAuth();
    if (enableNextAuth) {
      const { signOut } = await import('next-auth/react');
      signOut();
    }
  },
  openLogin: async () => {
    if (enableClerk) {
      console.log('fallbackRedirectUrl:', location.toString());

      get().clerkSignIn?.({ fallbackRedirectUrl: location.toString() });

      return;
    }

    const enableNextAuth = get().enabledNextAuth();
    if (enableNextAuth) {
      const { signIn } = await import('next-auth/react');
      signIn();
    }
  },

  openUserProfile: async () => {
    if (enableClerk) {
      get().clerkOpenUserProfile?.();

      return;
    }
  },
  refreshUserConfig: async () => {
    await mutate([USER_CONFIG_FETCH_KEY, true]);

    // when get the user config ,refresh the model provider list to the latest
    get().refreshModelProviderList();
  },
  useFetchUserConfig: (initServer) =>
    useSWR<UserConfig | undefined>(
      [USER_CONFIG_FETCH_KEY, initServer],
      async () => {
        if (!initServer) return;
        return userService.getUserConfig();
      },
      {
        onSuccess: (data) => {
          if (!data) return;

          set(
            { avatar: data.avatar, settings: data.settings, userId: data.uuid },
            false,
            n('fetchUserConfig', data),
          );

          // when get the user config ,refresh the model provider list to the latest
          get().refreshDefaultModelProviderList({ trigger: 'fetchUserConfig' });

          const { language } = settingsSelectors.currentSettings(get());
          if (language === 'auto') {
            switchLang('auto');
          }
        },
        revalidateOnFocus: false,
      },
    ),
});
