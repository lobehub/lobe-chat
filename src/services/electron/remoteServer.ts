import { DataSyncConfig, MarketAuthorizationParams, dispatch } from '@lobechat/electron-client-ipc';

class RemoteServerService {
  /**
   * 获取远程服务器配置
   */
  getRemoteServerConfig = async () => {
    return dispatch('getRemoteServerConfig');
  };

  /**
   * 设置远程服务器配置
   */
  setRemoteServerConfig = async (config: DataSyncConfig) => {
    return dispatch('setRemoteServerConfig', config);
  };

  /**
   * 清除远程服务器配置
   */
  clearRemoteServerConfig = async () => {
    return dispatch('clearRemoteServerConfig');
  };

  /**
   * 请求授权
   */
  requestAuthorization = async (config: DataSyncConfig) => {
    return dispatch('requestAuthorization', config);
  };

  /**
   * 请求 Market 授权
   */
  requestMarketAuthorization = async (params: MarketAuthorizationParams) => {
    return dispatch('requestMarketAuthorization', params);
  };
}

export const remoteServerService = new RemoteServerService();
