import { RemoteServerConfig, dispatch } from '@lobechat/electron-client-ipc';

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
  setRemoteServerConfig = async (config: RemoteServerConfig) => {
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
  requestAuthorization = async (serverUrl: string) => {
    return dispatch('requestAuthorization', serverUrl);
  };

  /**
   * 刷新访问令牌
   */
  refreshAccessToken = async () => {
    return dispatch('refreshAccessToken');
  };
}

export const remoteServerService = new RemoteServerService();
