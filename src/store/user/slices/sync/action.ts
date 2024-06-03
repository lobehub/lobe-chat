import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { syncService } from '@/services/sync';
import type { UserStore } from '@/store/user';
import { OnSyncEvent, PeerSyncStatus, SyncMethod } from '@/types/sync';
import { browserInfo } from '@/utils/platform';
import { setNamespace } from '@/utils/storeDebug';

import { userProfileSelectors } from '../auth/selectors';
import { keyVaultsConfigSelectors } from '../modelList/selectors';
import { syncSettingsSelectors } from './selectors';

const n = setNamespace('sync');

/**
 * 设置操作
 */
export interface SyncAction {
  refreshConnection: (onEvent: OnSyncEvent) => Promise<void>;
  triggerEnableSync: (userId: string, onEvent: OnSyncEvent) => Promise<boolean>;
  useEnabledSync: (
    systemEnable: boolean | undefined,
    params: {
      onEvent: OnSyncEvent;
      userEnableSync: {
        [K in SyncMethod]: boolean;
      };
      userId: string | undefined;
    },
  ) => SWRResponse;
}

export const channelSyncConfig = (selector: SyncMethod) => {
  const configs = {
    liveblocks: syncSettingsSelectors.liveblocksConfig,
    webrtc: syncSettingsSelectors.webrtcConfig,
  };
  return configs[selector];
};

export const createSyncSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  SyncAction
> = (set, get) => ({
  refreshConnection: async (onEvent) => {
    const userId = userProfileSelectors.userId(get());

    if (!userId) return;

    await get().triggerEnableSync(userId, onEvent);
  },

  triggerEnableSync: async (userId: string, onEvent: OnSyncEvent) => {
    // double-check the sync ability
    // if there is no channelName, don't start sync
    const webrtcConfig = syncSettingsSelectors.webrtcConfig(get());
    const liveblocksConfig = syncSettingsSelectors.liveblocksConfig(get());

    const accessCode = keyVaultsConfigSelectors.password(get());

    if (!webrtcConfig.channelName && !liveblocksConfig.roomName) return false;

    const name = syncSettingsSelectors.deviceName(get());

    const defaultUserName = `My ${browserInfo.browser} (${browserInfo.os})`;

    set({
      liveblocks: {
        awareness: [],
        enabled: liveblocksConfig.enabled && !!liveblocksConfig.roomName,
        status:
          liveblocksConfig.enabled && !!liveblocksConfig.roomName
            ? PeerSyncStatus.Connecting
            : PeerSyncStatus.Disabled,
      },
      webrtc: {
        awareness: [],
        enabled: webrtcConfig.enabled && !!webrtcConfig.channelName,
        status:
          webrtcConfig.enabled && !!webrtcConfig.channelName
            ? PeerSyncStatus.Connecting
            : PeerSyncStatus.Disabled,
      },
    });
    return syncService.enabledSync({
      channel: {
        liveblocks: {
          accessCode: accessCode,
          enabled: liveblocksConfig.enabled && !!liveblocksConfig.roomName,
          name: liveblocksConfig.roomName || '',
          password: liveblocksConfig.roomPassword,
          publicApiKey: liveblocksConfig.publicApiKey,
        },
        webrtc: {
          enabled: webrtcConfig.enabled && !!webrtcConfig.channelName,
          name: webrtcConfig.channelName || '',
          password: webrtcConfig.channelPassword,
          signaling: webrtcConfig.signaling,
        },
      },
      onAwarenessChange(state) {
        set({
          liveblocks: {
            ...get().liveblocks,
            awareness: state,
          },
          webrtc: {
            ...get().webrtc,
            awareness: state,
          },
        });
      },
      onSyncEvent: onEvent,
      onSyncStatusChange: (status) => {
        set({
          liveblocks: {
            ...get().liveblocks,
            status,
          },
          webrtc: {
            ...get().webrtc,
            status,
          },
        });
      },
      user: {
        id: userId,
        // if user don't set the name, use default name
        name: name || defaultUserName,
        ...browserInfo,
      },
    });
  },

  useEnabledSync: (systemEnable, { userEnableSync, userId, onEvent }) =>
    useSWR<boolean>(
      systemEnable ? ['enableSync', userEnableSync, userId] : null,
      async () => {
        // if user don't enable sync or no userId ,don't start sync
        if (!userId) return false;

        // if user disabled all sync channel, stop sync
        if (Object.values(userEnableSync).every((x) => !x)) return syncService.disableSync();

        return get().triggerEnableSync(userId, onEvent);
      },
      {
        onError: (error) => {
          console.error('useEnabledSync error:', error);
        },
        onSuccess: (syncEnabled) => {
          set(
            {
              liveblocks: {
                ...get().liveblocks,
                enabled: userEnableSync.liveblocks && syncEnabled,
              },
              webrtc: {
                ...get().webrtc,
                enabled: userEnableSync.webrtc && syncEnabled,
              },
            },
            false,
            n('useEnabledSync'),
          );
        },
        revalidateOnFocus: false,
      },
    ),
});
