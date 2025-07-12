import { NetworkProxySettings } from '@lobechat/electron-client-ipc';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { merge } from 'lodash';
import { isEqual } from 'lodash-es';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { fetch, getGlobalDispatcher, setGlobalDispatcher } from 'undici';

import { defaultProxySettings } from '@/const/store';
import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:NetworkProxyCtr');

/**
 * 代理配置验证结果
 */
interface ProxyValidationResult {
  errors: string[];
  isValid: boolean;
}

/**
 * 代理连接测试结果
 */
interface ProxyTestResult {
  message?: string;
  responseTime?: number;
  success: boolean;
}

/**
 * 代理配置验证器
 */
class ProxyConfigValidator {
  private static readonly SUPPORTED_TYPES = ['http', 'https', 'socks5'] as const;
  private static readonly DEFAULT_BYPASS = 'localhost,127.0.0.1,::1';

  /**
   * 验证代理配置
   */
  static validate(config: NetworkProxySettings): ProxyValidationResult {
    const errors: string[] = [];

    // 如果未启用代理，跳过验证
    if (!config.enableProxy) {
      return { errors: [], isValid: true };
    }

    // 验证代理类型
    if (!this.SUPPORTED_TYPES.includes(config.proxyType as any)) {
      errors.push(
        `Unsupported proxy type: ${config.proxyType}. Supported types: ${this.SUPPORTED_TYPES.join(', ')}`,
      );
    }

    // 验证代理服务器
    if (!config.proxyServer?.trim()) {
      errors.push('Proxy server is required when proxy is enabled');
    } else if (!this.isValidHost(config.proxyServer)) {
      errors.push('Invalid proxy server format');
    }

    // 验证代理端口
    if (!config.proxyPort?.trim()) {
      errors.push('Proxy port is required when proxy is enabled');
    } else {
      const port = parseInt(config.proxyPort, 10);
      if (isNaN(port) || port < 1 || port > 65_535) {
        errors.push('Proxy port must be a valid number between 1 and 65535');
      }
    }

    // 验证认证信息
    if (config.proxyRequireAuth) {
      if (!config.proxyUsername?.trim()) {
        errors.push('Proxy username is required when authentication is enabled');
      }
      if (!config.proxyPassword?.trim()) {
        errors.push('Proxy password is required when authentication is enabled');
      }
    }

    return {
      errors,
      isValid: errors.length === 0,
    };
  }

  /**
   * 验证主机名格式
   */
  private static isValidHost(host: string): boolean {
    // 简单的主机名验证（IP 地址或域名）
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const domainRegex =
      /^[\dA-Za-z]([\dA-Za-z-]*[\dA-Za-z])?(\.[\dA-Za-z]([\dA-Za-z-]*[\dA-Za-z])?)*$/;

    return ipRegex.test(host) || domainRegex.test(host);
  }
}

/**
 * 代理 URL 构建器
 */
const ProxyUrlBuilder = {
  /**
   * 构建代理 URL
   */
  build(config: NetworkProxySettings): string {
    const { proxyType, proxyServer, proxyPort, proxyRequireAuth, proxyUsername, proxyPassword } =
      config;

    let proxyUrl = `${proxyType}://${proxyServer}:${proxyPort}`;

    // 添加认证信息
    if (proxyRequireAuth && proxyUsername && proxyPassword) {
      const encodedUsername = encodeURIComponent(proxyUsername);
      const encodedPassword = encodeURIComponent(proxyPassword);
      proxyUrl = `${proxyType}://${encodedUsername}:${encodedPassword}@${proxyServer}:${proxyPort}`;
    }

    return proxyUrl;
  },
};

/**
 * 代理代理管理器
 */
class ProxyDispatcherManager {
  private static isChanging = false;
  private static changeQueue: Array<() => Promise<void>> = [];

  /**
   * 应用代理设置（带并发控制）
   */
  static async applyProxySettings(config: NetworkProxySettings): Promise<void> {
    return new Promise((resolve, reject) => {
      const operation = async () => {
        try {
          await this.doApplyProxySettings(config);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      if (this.isChanging) {
        // 如果正在切换，加入队列
        this.changeQueue.push(operation);
      } else {
        // 立即执行
        operation();
      }
    });
  }

  /**
   * 执行代理设置应用
   */
  private static async doApplyProxySettings(config: NetworkProxySettings): Promise<void> {
    this.isChanging = true;

    try {
      const currentDispatcher = getGlobalDispatcher();

      // 禁用代理，恢复默认连接
      if (!config.enableProxy) {
        await this.safeDestroyDispatcher(currentDispatcher);
        setGlobalDispatcher(undefined);
        logger.debug('Proxy disabled, reset to direct connection mode');
        return;
      }

      // 构建代理 URL
      const proxyUrl = ProxyUrlBuilder.build(config);

      // 创建代理 agent
      const agent = this.createProxyAgent(config.proxyType, proxyUrl);

      // 切换代理前销毁旧 dispatcher
      await this.safeDestroyDispatcher(currentDispatcher);
      setGlobalDispatcher(agent);

      logger.info(
        `Proxy settings applied: ${config.proxyType}://${config.proxyServer}:${config.proxyPort}`,
      );
      logger.debug(
        'Global request proxy set, all Node.js network requests will go through this proxy',
      );
    } finally {
      this.isChanging = false;

      // 处理队列中的下一个操作
      if (this.changeQueue.length > 0) {
        const nextOperation = this.changeQueue.shift();
        if (nextOperation) {
          setTimeout(() => nextOperation(), 0);
        }
      }
    }
  }

  /**
   * 创建代理 agent
   */
  private static createProxyAgent(proxyType: string, proxyUrl: string) {
    switch (proxyType) {
      case 'http': {
        return new HttpProxyAgent(proxyUrl);
      }
      case 'https': {
        return new HttpsProxyAgent(proxyUrl);
      }
      case 'socks5': {
        return new SocksProxyAgent(proxyUrl);
      }
      default: {
        throw new Error(`Unsupported proxy type: ${proxyType}`);
      }
    }
  }

  /**
   * 安全销毁 dispatcher
   */
  private static async safeDestroyDispatcher(dispatcher: any): Promise<void> {
    try {
      if (dispatcher && typeof dispatcher.destroy === 'function') {
        await dispatcher.destroy();
      }
    } catch (error) {
      logger.warn('Failed to destroy dispatcher:', error);
    }
  }
}

/**
 * 代理连接测试器
 */
class ProxyConnectionTester {
  private static readonly DEFAULT_TIMEOUT = 10_000; // 10秒超时
  private static readonly DEFAULT_TEST_URL = 'https://www.google.com';

  /**
   * 测试代理连接
   */
  static async testConnection(
    url: string = this.DEFAULT_TEST_URL,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
      logger.info(`Testing proxy connection with URL: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LobeChat-Desktop/1.0.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseTime = Date.now() - startTime;

      logger.info(`Proxy connection test successful, response time: ${responseTime}ms`);

      return {
        responseTime,
        success: true,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(`Proxy connection test failed after ${responseTime}ms:`, errorMessage);

      return {
        message: `Connection failed: ${errorMessage}`,
        responseTime,
        success: false,
      };
    }
  }

  /**
   * 测试指定代理配置的连接
   */
  static async testProxyConfig(
    config: NetworkProxySettings,
    testUrl: string = this.DEFAULT_TEST_URL,
  ): Promise<ProxyTestResult> {
    // 验证配置
    const validation = ProxyConfigValidator.validate(config);
    if (!validation.isValid) {
      return {
        message: `Invalid proxy configuration: ${validation.errors.join(', ')}`,
        success: false,
      };
    }

    // 如果未启用代理，直接测试
    if (!config.enableProxy) {
      return this.testConnection(testUrl);
    }

    // 创建临时代理 agent 进行测试
    try {
      const proxyUrl = ProxyUrlBuilder.build(config);
      console.log(testUrl);
      const agent = ProxyDispatcherManager['createProxyAgent'](config.proxyType, proxyUrl);
      console.log('agent:', agent);

      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

      const response = await fetch(testUrl, {
        dispatcher: agent,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        responseTime,
        success: true,
      };
    } catch (error) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        message: `Proxy test failed: ${errorMessage}`,
        success: false,
      };
    }
  }
}

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
      console.log(error);
      logger.error('Proxy config test failed:', error);
      return {
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * 应用初始代理设置
   */
  async afterAppReady(): Promise<void> {
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
