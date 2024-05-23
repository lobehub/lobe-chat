import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_PREFERENCE } from '@/const/user';
import { userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import type { GlobalServerConfig } from '@/types/serverConfig';
import type { GlobalSettings } from '@/types/settings';
import { UserInitializationState } from '@/types/user';
import { switchLang } from '@/utils/client/switchLang';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { preferenceSelectors } from '../preference/selectors';
import { settingsSelectors } from '../settings/selectors';

const n = setNamespace('common');

const GET_USER_STATE_KEY = 'initUserState';
/**
 * 设置操作
 */
export interface CommonAction {
  refreshUserState: () => Promise<void>;

  updateAvatar: (avatar: string) => Promise<void>;
  useCheckTrace: (shouldFetch: boolean) => SWRResponse;
  useInitUserState: (
    isLogin: boolean | undefined,
    serverConfig: GlobalServerConfig,
    options?: {
      onSuccess: (data: UserInitializationState) => void;
    },
  ) => SWRResponse;
}

export const createCommonSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  refreshUserState: async () => {
    await mutate(GET_USER_STATE_KEY);
  },
  updateAvatar: async (avatar) => {
    await userService.updateAvatar(avatar);
    await get().refreshUserState();
  },

  useCheckTrace: (shouldFetch) =>
    useSWR<boolean>(
      shouldFetch ? 'checkTrace' : null,
      () => {
        const userAllowTrace = preferenceSelectors.userAllowTrace(get());

        // if user have set the trace, return false
        if (typeof userAllowTrace === 'boolean') return Promise.resolve(false);

        return Promise.resolve(get().isUserCanEnableTrace);
      },
      {
        revalidateOnFocus: false,
      },
    ),

  useInitUserState: (isLogin, serverConfig, options) =>
    useSWR<UserInitializationState>(
      !!isLogin ? GET_USER_STATE_KEY : null,
      () => userService.getUserState(),
      {
        onSuccess: (data) => {
          options?.onSuccess?.(data);

          if (data) {
            // merge settings
            const serverSettings: DeepPartial<GlobalSettings> = {
              defaultAgent: serverConfig.defaultAgent,
              languageModel: serverConfig.languageModel,
            };
            const defaultSettings = merge(get().defaultSettings, serverSettings);

            // merge preference
            const isEmpty = Object.keys(data.preference || {}).length === 0;
            const preference = isEmpty ? DEFAULT_PREFERENCE : data.preference;

            set(
              {
                defaultSettings,
                enabledNextAuth: serverConfig.enabledOAuthSSO,
                isUserCanEnableTrace: data.canEnableTrace,
                isUserStateInit: true,
                preference,
                serverLanguageModel: serverConfig.languageModel,
                settings: data.settings || {},
                userId: data.userId,
              },
              false,
              n('initUserState'),
            );

            get().refreshDefaultModelProviderList({ trigger: 'fetchUserState' });

            // auto switch language
            const { language } = settingsSelectors.currentSettings(get());
            if (language === 'auto') {
              switchLang('auto');
            }
          }
        },
        revalidateOnFocus: false,
      },
    ),
});
