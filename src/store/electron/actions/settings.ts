import { NetworkProxySettings } from '@lobechat/electron-client-ipc';
import isEqual from 'fast-deep-equal';
import useSWR, { SWRResponse, mutate } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { desktopSettingsService } from '@/services/electron/settings';

import type { ElectronStore } from '../store';

/**
 * 设置操作
 */
export interface ElectronSettingsAction {
  refreshProxySettings: () => Promise<void>;
  setProxySettings: (params: Partial<NetworkProxySettings>) => Promise<void>;
  useGetProxySettings: () => SWRResponse;
}

const ELECTRON_PROXY_SETTINGS_KEY = 'electron:getProxySettings';

export const settingsSlice: StateCreator<
  ElectronStore,
  [['zustand/devtools', never]],
  [],
  ElectronSettingsAction
> = (set, get) => ({
  refreshProxySettings: async () => {
    await mutate(ELECTRON_PROXY_SETTINGS_KEY);
  },

  setProxySettings: async (values) => {
    try {
      // 更新设置
      await desktopSettingsService.setSettings(values);

      // 刷新状态
      await get().refreshProxySettings();
    } catch (error) {
      console.error('代理设置更新失败:', error);
    }
  },

  useGetProxySettings: () =>
    useSWR<NetworkProxySettings>(
      ELECTRON_PROXY_SETTINGS_KEY,
      async () => desktopSettingsService.getProxySettings(),
      {
        onSuccess: (data) => {
          if (!isEqual(data, get().proxySettings)) {
            set({ proxySettings: data });
          }
        },
      },
    ),
});
