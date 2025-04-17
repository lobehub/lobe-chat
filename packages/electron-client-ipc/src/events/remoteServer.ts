import { RemoteServerConfig } from '../types/remoteServer';

/**
 * 远程服务器配置相关的事件
 */
export interface RemoteServerDispatchEvents {
  clearRemoteServerConfig: () => boolean;
  getRemoteServerConfig: () => RemoteServerConfig;
  refreshAccessToken: () => {
    error?: string;
    success: boolean;
  };
  requestAuthorization: (serverUrl: string) => {
    error?: string;
    success: boolean;
  };
  setRemoteServerConfig: (config: RemoteServerConfig) => boolean;
}

/**
 * 从主进程广播的远程服务器相关事件
 */
export interface RemoteServerBroadcastEvents {
  authorizationFailed: (params: { error: string }) => void;
  authorizationRequired: (params: void) => void;
  authorizationSuccessful: (params: void) => void;
  tokenRefreshed: (params: void) => void;
}
