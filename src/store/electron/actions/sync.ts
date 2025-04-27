import { DataSyncConfig } from '@lobechat/electron-client-ipc';
import isEqual from 'fast-deep-equal';
import useSWR, { SWRResponse, mutate } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { remoteServerService } from '@/services/electron/remoteServer';

import { initialState } from '../initialState';
import type { ElectronStore } from '../store';

/**
 * 设置操作
 */
export interface ElectronRemoteServerAction {
  connectRemoteServer: (params: DataSyncConfig) => Promise<void>;
  disconnectRemoteServer: () => Promise<void>;
  refreshServerConfig: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  useDataSyncConfig: () => SWRResponse;
  useRefreshDataWhenActive: (active?: boolean) => SWRResponse;
}

const REMOTE_SERVER_CONFIG_KEY = 'electron:getRemoteServerConfig';

export const remoteSyncSlice: StateCreator<
  ElectronStore,
  [['zustand/devtools', never]],
  [],
  ElectronRemoteServerAction
> = (set, get) => ({
  connectRemoteServer: async (values) => {
    if (!values.remoteServerUrl) return;

    set({ isConnectingServer: true });
    try {
      // 获取当前配置
      const config = await remoteServerService.getRemoteServerConfig();

      // 如果已经激活，需要先清除
      if (!isEqual(config, values)) {
        await remoteServerService.setRemoteServerConfig({ ...values, active: false });
      }

      // 请求授权
      const result = await remoteServerService.requestAuthorization(values);

      if (!result.success) {
        console.error('请求授权失败:', result.error);

        set({
          remoteServerSyncError: { message: result.error, type: 'AUTH_ERROR' },
        });
      }
      // 刷新状态
      await get().refreshServerConfig();
    } catch (error) {
      console.error('远程服务器配置出错:', error);
      set({
        remoteServerSyncError: { message: (error as Error).message, type: 'CONFIG_ERROR' },
      });
    } finally {
      set({ isConnectingServer: false });
    }
  },

  disconnectRemoteServer: async () => {
    set({ isConnectingServer: false });
    try {
      await remoteServerService.setRemoteServerConfig({ active: false, storageMode: 'local' });
      // 更新表单URL为空
      set({ dataSyncConfig: initialState.dataSyncConfig });
      // 刷新状态
      await get().refreshServerConfig();
    } catch (error) {
      console.error('断开连接失败:', error);
      set({
        remoteServerSyncError: { message: (error as Error).message, type: 'DISCONNECT_ERROR' },
      });
    } finally {
      set({ isConnectingServer: false });
    }
  },

  refreshServerConfig: async () => {
    await mutate(REMOTE_SERVER_CONFIG_KEY);
  },

  refreshUserData: async () => {
    const { getSessionStoreState } = await import('@/store/session');
    const { getChatStoreState } = await import('@/store/chat');
    const { getUserStoreState } = await import('@/store/user');

    await getSessionStoreState().refreshSessions();
    await getChatStoreState().refreshMessages();
    await getChatStoreState().refreshTopic();
    await getUserStoreState().refreshUserState();
  },

  useDataSyncConfig: () =>
    useSWR<DataSyncConfig>(
      REMOTE_SERVER_CONFIG_KEY,
      async () => {
        try {
          return await remoteServerService.getRemoteServerConfig();
        } catch (error) {
          console.error('获取远程服务器配置失败:', error);
          throw error;
        }
      },
      {
        onSuccess: (data) => {
          set({ dataSyncConfig: data, isInitRemoteServerConfig: true });
        },
      },
    ),
  useRefreshDataWhenActive: (active) =>
    useSWR(['refreshDataWhenActive', active], async () => {
      if (!active) return;

      await get().refreshUserData();
    }),
});
