import { gt } from 'semver';
import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { CURRENT_VERSION } from '@/const/version';
import { globalService } from '@/services/global';
import { UserConfig, userService } from '@/services/user';
import type { GlobalStore } from '@/store/global';
import type { GlobalServerConfig, GlobalSettings } from '@/types/settings';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';
import { switchLang } from '@/utils/switchLang';

import { settingsSelectors } from '../settings/selectors';

const n = setNamespace('common');

/**
 * 设置操作
 */
export interface CommonAction {
  refreshUserConfig: () => Promise<void>;
  switchBackToChat: (sessionId?: string) => void;
  updateAvatar: (avatar: string) => Promise<void>;
  useCheckLatestVersion: () => SWRResponse<string>;
  useFetchServerConfig: () => SWRResponse;
  useFetchUserConfig: (initServer: boolean) => SWRResponse<UserConfig | undefined>;
}

const USER_CONFIG_FETCH_KEY = 'fetchUserConfig';

export const createCommonSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  refreshUserConfig: async () => {
    await mutate([USER_CONFIG_FETCH_KEY, true]);
  },
  switchBackToChat: (sessionId) => {
    get().router?.push(SESSION_CHAT_URL(sessionId || INBOX_SESSION_ID, get().isMobile));
  },

  updateAvatar: async (avatar) => {
    await userService.updateAvatar(avatar);
    await get().refreshUserConfig();
  },
  useCheckLatestVersion: () =>
    useSWR('checkLatestVersion', globalService.getLatestVersion, {
      // check latest version every 30 minutes
      focusThrottleInterval: 1000 * 60 * 30,
      onSuccess: (data: string) => {
        if (gt(data, CURRENT_VERSION))
          set({ hasNewVersion: true, latestVersion: data }, false, n('checkLatestVersion'));
      },
    }),
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

          const { language } = settingsSelectors.currentSettings(get());
          if (language === 'auto') {
            switchLang('auto');
          }
        },
        revalidateOnFocus: false,
      },
    ),
});
