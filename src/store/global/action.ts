import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import { gt } from 'semver';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { CURRENT_VERSION } from '@/const/version';
import { useClientDataSWR } from '@/libs/swr';
import { globalService } from '@/services/global';
import type { GlobalStore } from '@/store/global/index';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalPreference } from './initialState';

const n = setNamespace('preference');

/**
 * 设置操作
 */
export interface GlobalStoreAction {
  switchBackToChat: (sessionId?: string) => void;
  toggleChatSideBar: (visible?: boolean) => void;
  toggleExpandSessionGroup: (id: string, expand: boolean) => void;
  toggleMobileTopic: (visible?: boolean) => void;
  toggleSystemRole: (visible?: boolean) => void;
  updatePreference: (preference: Partial<GlobalPreference>, action?: any) => void;
  useCheckLatestVersion: () => SWRResponse<string>;
  useInitGlobalPreference: () => SWRResponse;
}

export const globalActionSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  GlobalStoreAction
> = (set, get) => ({
  switchBackToChat: (sessionId) => {
    get().router?.push(SESSION_CHAT_URL(sessionId || INBOX_SESSION_ID, get().isMobile));
  },
  toggleChatSideBar: (newValue) => {
    const showChatSideBar =
      typeof newValue === 'boolean' ? newValue : !get().preference.showChatSideBar;

    get().updatePreference({ showChatSideBar }, n('toggleAgentPanel', newValue));
  },
  toggleExpandSessionGroup: (id, expand) => {
    const { preference } = get();
    const nextExpandSessionGroup = produce(preference.expandSessionGroupKeys, (draft: string[]) => {
      if (expand) {
        if (draft.includes(id)) return;
        draft.push(id);
      } else {
        const index = draft.indexOf(id);
        if (index !== -1) draft.splice(index, 1);
      }
    });
    get().updatePreference({ expandSessionGroupKeys: nextExpandSessionGroup });
  },
  toggleMobileTopic: (newValue) => {
    const mobileShowTopic =
      typeof newValue === 'boolean' ? newValue : !get().preference.mobileShowTopic;

    get().updatePreference({ mobileShowTopic }, n('toggleMobileTopic', newValue));
  },
  toggleSystemRole: (newValue) => {
    const showSystemRole =
      typeof newValue === 'boolean' ? newValue : !get().preference.mobileShowTopic;

    get().updatePreference({ showSystemRole }, n('toggleMobileTopic', newValue));
  },
  updatePreference: (preference, action) => {
    const nextPreference = merge(get().preference, preference);

    set({ preference: nextPreference }, false, action || n('updatePreference'));

    get().preferenceStorage.saveToLocalStorage(nextPreference);
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

  useInitGlobalPreference: () =>
    useClientDataSWR<GlobalPreference>(
      'initGlobalPreference',
      () => get().preferenceStorage.getFromLocalStorage(),
      {
        onSuccess: (preference) => {
          const nextPreference = merge(get().preference, preference);

          set({ isPreferenceInit: true });

          if (isEqual(get().preference, nextPreference)) return;

          set({ preference: nextPreference }, false, n('initPreference'));
        },
      },
    ),
});
