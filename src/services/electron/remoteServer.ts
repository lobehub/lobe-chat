import { DataSyncConfig, dispatch } from '@lobechat/electron-client-ipc';

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
}

export const remoteServerService = new RemoteServerService();
