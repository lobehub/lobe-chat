import { NetworkProxySettings } from '@lobechat/electron-client-ipc';
import { merge } from 'lodash';
import { isEqual } from 'lodash-es';

import { defaultProxySettings } from '@/const/store';
import { createLogger } from '@/utils/logger';

import {
  ProxyConfigValidator,
  ProxyConnectionTester,
  ProxyDispatcherManager,
  ProxyTestResult,
} from '../modules/networkProxy';
import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:NetworkProxyCtr');

/**
 * 网络代理控制器
 * 处理桌面应用的网络代理相关功能
 */
export default class NetworkProxyCtr extends ControllerModule {
  /**
   * 获取代理设置
   */
  @ipcClientEvent('getProxySettings')
  async getDesktopSettings(): Promise<NetworkProxySettings> {
    try {
      const settings = this.app.storeManager.get(
        'networkProxy',
        defaultProxySettings,
      ) as NetworkProxySettings;
      logger.debug('Retrieved proxy settings:', {
        enableProxy: settings.enableProxy,
        proxyType: settings.proxyType,
      });
      return settings;
    } catch (error) {
      logger.error('Failed to get proxy settings:', error);
      return defaultProxySettings;
    }
  }

  /**
   * 设置代理配置
   */
  @ipcClientEvent('setProxySettings')
  async setProxySettings(config: NetworkProxySettings): Promise<void> {
    try {
      // 验证配置
      const validation = ProxyConfigValidator.validate(config);
      if (!validation.isValid) {
        const errorMessage = `Invalid proxy configuration: ${validation.errors.join(', ')}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // 获取当前配置
      const currentConfig = this.app.storeManager.get(
        'networkProxy',
        defaultProxySettings,
      ) as NetworkProxySettings;

      // 检查是否有变化
      if (isEqual(currentConfig, config)) {
        logger.debug('Proxy settings unchanged, skipping update');
        return;
      }

      // 合并配置
      const newConfig = merge({}, currentConfig, config);

      // 应用代理设置
      await ProxyDispatcherManager.applyProxySettings(newConfig);

      // 保存到存储
      this.app.storeManager.set('networkProxy', newConfig);

      logger.info('Proxy settings updated successfully', {
        enableProxy: newConfig.enableProxy,
        proxyPort: newConfig.proxyPort,
        proxyServer: newConfig.proxyServer,
        proxyType: newConfig.proxyType,
      });
    } catch (error) {
      logger.error('Failed to update proxy settings:', error);
      throw error;
    }
  }

  /**
   * 测试代理连接
   */
  @ipcClientEvent('testProxyConnection')
  async testProxyConnection(url: string): Promise<{ message?: string; success: boolean }> {
    try {
      const result = await ProxyConnectionTester.testConnection(url);

      if (result.success) {
        return { success: true };
      } else {
        throw new Error(result.message || 'Connection test failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Proxy connection test failed:', errorMessage);
      throw new Error(`Connection failed: ${errorMessage}`);
    }
  }

  /**
   * 测试指定代理配置
   */
  @ipcClientEvent('testProxyConfig')
  async testProxyConfig({
    config,
    testUrl,
  }: {
    config: NetworkProxySettings;
    testUrl?: string;
  }): Promise<ProxyTestResult> {
    try {
      return await ProxyConnectionTester.testProxyConfig(config, testUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Proxy config test failed:', errorMessage);
      return {
        message: `Proxy config test failed: ${errorMessage}`,
        success: false,
      };
    }
  }

  /**
   * 应用初始代理设置
   */
  async beforeAppReady(): Promise<void> {
    try {
      // 获取存储的代理设置
      const networkProxy = this.app.storeManager.get(
        'networkProxy',
        defaultProxySettings,
      ) as NetworkProxySettings;

      // 验证配置
      const validation = ProxyConfigValidator.validate(networkProxy);
      if (!validation.isValid) {
        logger.warn('Invalid stored proxy configuration, using defaults:', validation.errors);
        await ProxyDispatcherManager.applyProxySettings(defaultProxySettings);
        return;
      }

      // 应用代理设置
      await ProxyDispatcherManager.applyProxySettings(networkProxy);

      logger.info('Initial proxy settings applied successfully', {
        enableProxy: networkProxy.enableProxy,
        proxyType: networkProxy.proxyType,
      });
    } catch (error) {
      logger.error('Failed to apply initial proxy settings:', error);
      // 出错时使用默认设置
      try {
        await ProxyDispatcherManager.applyProxySettings(defaultProxySettings);
        logger.info('Fallback to default proxy settings');
      } catch (fallbackError) {
        logger.error('Failed to apply fallback proxy settings:', fallbackError);
      }
    }
  }
}
