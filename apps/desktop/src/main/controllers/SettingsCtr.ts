import { NetworkProxySettings } from '@lobechat/electron-client-ipc';
import { merge } from 'lodash';
import { isEqual } from 'lodash-es';
import { ProxyAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';

import { createLogger } from '@/utils/logger';

import { defaultProxySettings } from '../const/store';
import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:SettingsCtr');

/**
 * Settings Controller
 * Handles desktop settings-related functionality, including network proxy settings
 */
export default class SettingsCtr extends ControllerModule {
  /**
   * Get desktop settings
   * Including network proxy settings
   */
  @ipcClientEvent('getProxySettings')
  async getDesktopSettings(): Promise<NetworkProxySettings> {
    return this.app.storeManager.get('networkProxy', defaultProxySettings) as NetworkProxySettings;
  }

  /**
   * Set network proxy settings
   * @param config Proxy configuration
   */
  @ipcClientEvent('setProxySettings')
  async setProxySettings(config: NetworkProxySettings): Promise<void> {
    try {
      const before = this.app.storeManager.get('networkProxy', defaultProxySettings);
      if (isEqual(before, config)) return;

      // Update network proxy settings in local storage
      const newConfig = merge(before, config);
      this.app.storeManager.set('networkProxy', newConfig);

      // Apply network proxy settings
      await this.applyProxySettings(newConfig);

      logger.info('Network proxy settings updated');
    } catch (error) {
      logger.error('Failed to update proxy settings:', error);
      throw error;
    }
  }

  /**
   * Test proxy connection
   * @param url The URL to test with
   */
  @ipcClientEvent('testProxyConnection')
  async testProxyConnection(url: string): Promise<{ message?: string; success: boolean }> {
    try {
      logger.info(`Testing proxy connection with URL: ${url}`);

      // Attempt to fetch the URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      logger.info('Proxy connection test successful');
      return { success: true };
    } catch (error) {
      logger.error('Proxy connection test failed:', error);
      throw new Error(`连接失败: ${(error as Error).message}`);
    }
  }

  /**
   * Execute after app is ready
   * Apply initial proxy settings
   */
  async afterAppReady() {
    try {
      // Get and apply stored proxy settings
      const networkProxy = this.app.storeManager.get(
        'networkProxy',
        defaultProxySettings,
      ) as NetworkProxySettings;
      await this.applyProxySettings(networkProxy);

      logger.info('Initial proxy settings applied');
    } catch (error) {
      logger.error('Failed to apply initial proxy settings:', error);
    }
  }

  /**
   * Apply network proxy settings at request level
   * Use undici's ProxyAgent to set global request proxy
   * @param config Proxy configuration
   */
  private applyProxySettings = async (config: NetworkProxySettings) => {
    try {
      if (!config.enableProxy) {
        // Disable proxy, reset global dispatcher
        const dispatcher = getGlobalDispatcher();
        await dispatcher.destroy();
        logger.debug('Proxy disabled, reset to direct connection mode');
        return;
      }

      const { proxyType, proxyServer, proxyPort, proxyRequireAuth, proxyUsername, proxyPassword } =
        config;

      // Validate required fields
      if (!proxyServer || !proxyPort) {
        logger.warn('Proxy server or port not set, cannot apply proxy');
        return;
      }

      // Build proxy URL
      let proxyUrl = `${proxyType}://${proxyServer}:${proxyPort}`;

      // Add authentication if needed
      if (proxyRequireAuth && proxyUsername && proxyPassword) {
        proxyUrl = `${proxyType}://${encodeURIComponent(proxyUsername)}:${encodeURIComponent(proxyPassword)}@${proxyServer}:${proxyPort}`;
      }

      // Set global request proxy
      setGlobalDispatcher(new ProxyAgent({ uri: proxyUrl }));

      logger.info(`Proxy settings applied: ${proxyType}://${proxyServer}:${proxyPort}`);
      logger.debug(
        'Global request proxy set, all Node.js network requests will go through this proxy',
      );
    } catch (error) {
      logger.error('Failed to apply proxy settings:', error);
    }
  };
}
