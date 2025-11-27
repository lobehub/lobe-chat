import {
  NetworkProxySettings,
  ShortcutUpdateResult,
  dispatch,
} from '@lobechat/electron-client-ipc';

class DesktopSettingsService {
  /**
   * Get proxy settings
   */
  getProxySettings = async () => {
    return dispatch('getProxySettings');
  };

  /**
   * Set proxy settings
   */
  setSettings = async (data: Partial<NetworkProxySettings>) => {
    return dispatch('setProxySettings', data);
  };

  /**
   * Get desktop hotkey configuration
   */
  getDesktopHotkeys = async () => {
    return dispatch('getShortcutsConfig');
  };

  /**
   * Update desktop hotkey configuration
   */
  updateDesktopHotkey = async (id: string, accelerator: string): Promise<ShortcutUpdateResult> => {
    return dispatch('updateShortcutConfig', { accelerator, id });
  };

  /**
   * Test proxy connection
   */
  testProxyConnection = async (url: string) => {
    return dispatch('testProxyConnection', url);
  };

  /**
   * Test specified proxy configuration
   */
  testProxyConfig = async (config: NetworkProxySettings, testUrl?: string) => {
    return dispatch('testProxyConfig', { config, testUrl });
  };
}

export const desktopSettingsService = new DesktopSettingsService();
