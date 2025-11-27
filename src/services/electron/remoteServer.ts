import { DataSyncConfig, MarketAuthorizationParams, dispatch } from '@lobechat/electron-client-ipc';

class RemoteServerService {
  /**
   * Get remote server configuration
   */
  getRemoteServerConfig = async () => {
    return dispatch('getRemoteServerConfig');
  };

  /**
   * Set remote server configuration
   */
  setRemoteServerConfig = async (config: DataSyncConfig) => {
    return dispatch('setRemoteServerConfig', config);
  };

  /**
   * Clear remote server configuration
   */
  clearRemoteServerConfig = async () => {
    return dispatch('clearRemoteServerConfig');
  };

  /**
   * Request authorization
   */
  requestAuthorization = async (config: DataSyncConfig) => {
    return dispatch('requestAuthorization', config);
  };

  /**
   * Request Market authorization
   */
  requestMarketAuthorization = async (params: MarketAuthorizationParams) => {
    return dispatch('requestMarketAuthorization', params);
  };
}

export const remoteServerService = new RemoteServerService();
