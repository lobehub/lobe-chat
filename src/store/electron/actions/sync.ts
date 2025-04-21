import { RemoteServerConfig } from '@lobechat/electron-client-ipc';
import useSWR, { SWRResponse, mutate } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { remoteServerService } from '@/services/electron/remoteServer';

import { initialState } from '../initialState';
import type { ElectronStore } from '../store';

/**
 * 设置操作
 */
export interface ElectronRemoteServerAction {
  connectRemoteServer: (params: { isSelfHosted: boolean; serverUrl?: string }) => Promise<void>;
  disconnectRemoteServer: () => Promise<void>;
  refreshServerConfig: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  useRemoteServerConfig: () => SWRResponse;
}

const REMOTE_SERVER_CONFIG_KEY = 'electron:getRemoteServerConfig';

export const remoteSyncSlice: StateCreator<
  ElectronStore,
  [['zustand/devtools', never]],
  [],
  ElectronRemoteServerAction
> = (set, get) => ({
  connectRemoteServer: async (values) => {
    if (!values.serverUrl) return;

    set({ isConnectingServer: true });
    try {
      // 获取当前配置
      const config = await remoteServerService.getRemoteServerConfig();

      // 如果已经激活，需要先清除
      if (config.active) {
        await remoteServerService.clearRemoteServerConfig();
      }

      // 请求授权
      const result = await remoteServerService.requestAuthorization(values.serverUrl);

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
      await remoteServerService.clearRemoteServerConfig();
      // 更新表单URL为空
      set({ remoteServerConfig: initialState.remoteServerConfig });
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
    getSessionStoreState().switchSession(INBOX_SESSION_ID);
  },

  useRemoteServerConfig: () =>
    useSWR<RemoteServerConfig>(
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
          set({ isInitRemoteServerConfig: true, remoteServerConfig: data });
          get().refreshUserData();
        },
      },
    ),
});
