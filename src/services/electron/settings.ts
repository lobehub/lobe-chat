import {
  NetworkProxySettings,
  ShortcutUpdateResult,
  dispatch,
} from '@lobechat/electron-client-ipc';

class DesktopSettingsService {
  /**
   * 获取远程服务器配置
   */
  getProxySettings = async () => {
    return dispatch('getProxySettings');
  };

  /**
   * 设置远程服务器配置
   */
  setSettings = async (data: Partial<NetworkProxySettings>) => {
    return dispatch('setProxySettings', data);
  };

  /**
   * 获取桌面热键配置
   */
  getDesktopHotkeys = async () => {
    return dispatch('getShortcutsConfig');
  };

  /**
   * 更新桌面热键配置
   */
  updateDesktopHotkey = async (id: string, accelerator: string): Promise<ShortcutUpdateResult> => {
    return dispatch('updateShortcutConfig', { accelerator, id });
  };

  /**
   * 测试代理连接
   */
  testProxyConnection = async (url: string) => {
    return dispatch('testProxyConnection', url);
  };

  /**
   * 测试指定的代理配置
   */
  testProxyConfig = async (config: NetworkProxySettings, testUrl?: string) => {
    return dispatch('testProxyConfig', { config, testUrl });
  };
}

export const desktopSettingsService = new DesktopSettingsService();
