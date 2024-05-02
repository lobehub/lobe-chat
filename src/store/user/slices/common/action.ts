import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { globalService } from '@/services/global';
import { messageService } from '@/services/message';
import { UserConfig, userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import type { GlobalServerConfig } from '@/types/serverConfig';
import type { GlobalSettings } from '@/types/settings';
import { switchLang } from '@/utils/client/switchLang';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { preferenceSelectors } from '../preference/selectors';
import { settingsSelectors } from '../settings/selectors';

const n = setNamespace('common');

/**
 * 设置操作
 */
export interface CommonAction {
  refreshUserConfig: () => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  useCheckTrace: (shouldFetch: boolean) => SWRResponse;
  useFetchServerConfig: () => SWRResponse;
  useFetchUserConfig: (initServer: boolean) => SWRResponse<UserConfig | undefined>;
}

const USER_CONFIG_FETCH_KEY = 'fetchUserConfig';

export const createCommonSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  refreshUserConfig: async () => {
    await mutate([USER_CONFIG_FETCH_KEY, true]);

    // when get the user config ,refresh the model provider list to the latest
    get().refreshModelProviderList();
  },

  updateAvatar: async (avatar) => {
    await userService.updateAvatar(avatar);
    await get().refreshUserConfig();
  },
  useCheckTrace: (shouldFetch) =>
    useSWR<boolean>(
      ['checkTrace', shouldFetch],
      () => {
        const userAllowTrace = preferenceSelectors.userAllowTrace(get());
        // if not init with server side, return false
        if (!shouldFetch) return Promise.resolve(false);

        // if user have set the trace, return false
        if (typeof userAllowTrace === 'boolean') return Promise.resolve(false);

        return messageService.messageCountToCheckTrace();
      },
      {
        revalidateOnFocus: false,
      },
    ),

  useFetchServerConfig: () =>
    useSWR<GlobalServerConfig>('fetchGlobalConfig', globalService.getGlobalConfig, {
      onSuccess: (data) => {
        if (data) {
          const serverSettings: DeepPartial<GlobalSettings> = {
            defaultAgent: data.defaultAgent,
            languageModel: data.languageModel,
          };

          const defaultSettings = merge(get().defaultSettings, serverSettings);

          set({ defaultSettings, serverConfig: data }, false, n('initGlobalConfig'));

          get().refreshDefaultModelProviderList({ trigger: 'fetchServerConfig' });
        }
      },
      revalidateOnFocus: false,
    }),
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
