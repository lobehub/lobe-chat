import { DataSyncConfig } from '../types/dataSync';
import { ProxyTRPCRequestParams, ProxyTRPCRequestResult } from '../types/proxyTRPCRequest';

export interface MarketAuthorizationParams {
  authUrl: string;
}

/**
 * 远程服务器配置相关的事件
 */
export interface RemoteServerDispatchEvents {
  clearRemoteServerConfig: () => boolean;
  getRemoteServerConfig: () => DataSyncConfig;
  /**
   * Proxy a tRPC request to the remote server.
   * @param args - Request arguments.
   * @returns Promise resolving with the response details.
   */
  proxyTRPCRequest: (args: ProxyTRPCRequestParams) => ProxyTRPCRequestResult;
  refreshAccessToken: () => {
    error?: string;
    success: boolean;
  };
  requestAuthorization: (config: DataSyncConfig) => {
    error?: string;
    success: boolean;
  };
  requestMarketAuthorization: (params: MarketAuthorizationParams) => {
    error?: string;
    success: boolean;
  };
  setRemoteServerConfig: (config: DataSyncConfig) => boolean;
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
