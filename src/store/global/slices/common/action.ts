import { gt } from 'semver';
import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { CURRENT_VERSION } from '@/const/version';
import { globalService } from '@/services/global';
import { messageService } from '@/services/message';
import { UserConfig, userService } from '@/services/user';
import type { GlobalStore } from '@/store/global';
import type { GlobalServerConfig, GlobalSettings } from '@/types/settings';
import { OnSyncEvent, PeerSyncStatus } from '@/types/sync';
import { switchLang } from '@/utils/client/switchLang';
import { merge } from '@/utils/merge';
import { browserInfo } from '@/utils/platform';
import { setNamespace } from '@/utils/storeDebug';

import { preferenceSelectors } from '../preference/selectors';
import { settingsSelectors, syncSettingsSelectors } from '../settings/selectors';
import { commonSelectors } from './selectors';

const n = setNamespace('common');

/**
 * 设置操作
 */
export interface CommonAction {
  refreshConnection: (onEvent: OnSyncEvent) => Promise<void>;
  refreshUserConfig: () => Promise<void>;
  switchBackToChat: (sessionId?: string) => void;
  triggerEnableSync: (userId: string, onEvent: OnSyncEvent) => Promise<boolean>;
  updateAvatar: (avatar: string) => Promise<void>;
  useCheckLatestVersion: () => SWRResponse<string>;
  useCheckTrace: (shouldFetch: boolean) => SWRResponse;
  useEnabledSync: (
    userEnableSync: boolean,
    userId: string | undefined,
    onEvent: OnSyncEvent,
  ) => SWRResponse;
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
  refreshConnection: async (onEvent) => {
    const userId = commonSelectors.userId(get());

    if (!userId) return;

    await get().triggerEnableSync(userId, onEvent);
  },

  refreshUserConfig: async () => {
    await mutate([USER_CONFIG_FETCH_KEY, true]);
  },

  switchBackToChat: (sessionId) => {
    get().router?.push(SESSION_CHAT_URL(sessionId || INBOX_SESSION_ID, get().isMobile));
  },
  triggerEnableSync: async (userId: string, onEvent: OnSyncEvent) => {
    // double-check the sync ability
    // if there is no channelName, don't start sync
    const sync = syncSettingsSelectors.webrtcConfig(get());
    if (!sync.channelName) return false;

    const name = syncSettingsSelectors.deviceName(get());

    const defaultUserName = `My ${browserInfo.browser} (${browserInfo.os})`;

    set({ syncStatus: PeerSyncStatus.Connecting });
    return globalService.enabledSync({
      channel: {
        name: sync.channelName,
        password: sync.channelPassword,
      },
      onAwarenessChange(state) {
        set({ syncAwareness: state });
      },
      onSyncEvent: onEvent,
      onSyncStatusChange: (status) => {
        set({ syncStatus: status });
      },
      signaling: sync.signaling,
      user: {
        id: userId,
        // if user don't set the name, use default name
        name: name || defaultUserName,
        ...browserInfo,
      },
    });
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

  useEnabledSync: (userEnableSync, userId, onEvent) =>
    useSWR<boolean>(
      ['enableSync', userEnableSync, userId],
      async () => {
        // if user don't enable sync or no userId ,don't start sync
        if (!userId) return false;

        // if user don't enable sync, stop sync
        if (!userEnableSync) return globalService.disableSync();

        return get().triggerEnableSync(userId, onEvent);
      },
      {
        onSuccess: (syncEnabled) => {
          set({ syncEnabled });
        },
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
