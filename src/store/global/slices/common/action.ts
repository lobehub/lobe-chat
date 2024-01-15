import { produce } from 'immer';
import { gt } from 'semver';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { CURRENT_VERSION } from '@/const/version';
import { globalService } from '@/services/global';
import type { GlobalStore } from '@/store/global';
import type { GlobalServerConfig } from '@/types/settings';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalCommonState, GlobalPreference, Guide, SidebarTabKey } from './initialState';

const n = setNamespace('settings');

/**
 * 设置操作
 */
export interface CommonAction {
  /**
   * 切换侧边栏选项
   * @param key - 选中的侧边栏选项
   */
  switchSideBar: (key: SidebarTabKey) => void;
  toggleChatSideBar: (visible?: boolean) => void;
  toggleMobileTopic: (visible?: boolean) => void;
  toggleSystemRole: (visible?: boolean) => void;
  updateGuideState: (guide: Partial<Guide>) => void;
  updatePreference: (preference: Partial<GlobalPreference>, action?: string) => void;
  useCheckLatestVersion: () => SWRResponse<string>;
  useFetchGlobalConfig: () => SWRResponse;
}

export const createCommonSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  switchSideBar: (key) => {
    set({ sidebarKey: key }, false, n('switchSideBar', key));
  },
  toggleChatSideBar: (newValue) => {
    const showChatSideBar =
      typeof newValue === 'boolean' ? newValue : !get().preference.showChatSideBar;

    get().updatePreference({ showChatSideBar }, n('toggleAgentPanel', newValue) as string);
  },
  toggleMobileTopic: (newValue) => {
    const mobileShowTopic =
      typeof newValue === 'boolean' ? newValue : !get().preference.mobileShowTopic;

    get().updatePreference({ mobileShowTopic }, n('toggleMobileTopic', newValue) as string);
  },
  toggleSystemRole: (newValue) => {
    const showSystemRole =
      typeof newValue === 'boolean' ? newValue : !get().preference.mobileShowTopic;

    get().updatePreference({ showSystemRole }, n('toggleMobileTopic', newValue) as string);
  },
  updateGuideState: (guide) => {
    const { updatePreference } = get();
    const nextGuide = merge(get().preference.guide, guide);
    updatePreference({ guide: nextGuide });
  },
  updatePreference: (preference, action) => {
    set(
      produce((draft: GlobalCommonState) => {
        draft.preference = merge(draft.preference, preference);
      }),
      false,
      action,
    );
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
  useFetchGlobalConfig: () =>
    useSWR<GlobalServerConfig>('fetchGlobalConfig', globalService.getGlobalConfig, {
      onSuccess: (data) => {
        if (data) set({ serverConfig: data });
      },
      revalidateOnFocus: false,
    }),
});
