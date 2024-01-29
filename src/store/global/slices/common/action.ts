import { gt } from 'semver';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { CURRENT_VERSION } from '@/const/version';
import { globalService } from '@/services/global';
import type { GlobalStore } from '@/store/global';
import type { GlobalServerConfig } from '@/types/settings';
import { setNamespace } from '@/utils/storeDebug';

import type { SidebarTabKey } from './initialState';

const n = setNamespace('common');

/**
 * 设置操作
 */
export interface CommonAction {
  switchBackToChat: (sessionId?: string) => void;
  /**
   * 切换侧边栏选项
   * @param key - 选中的侧边栏选项
   */
  switchSideBar: (key: SidebarTabKey) => void;

  useCheckLatestVersion: () => SWRResponse<string>;
  useFetchGlobalConfig: () => SWRResponse;
}

export const createCommonSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  switchBackToChat: (sessionId) => {
    get().router?.push(SESSION_CHAT_URL(sessionId || INBOX_SESSION_ID, get().isMobile));
  },
  switchSideBar: (key) => {
    set({ sidebarKey: key }, false, n('switchSideBar', key));
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
