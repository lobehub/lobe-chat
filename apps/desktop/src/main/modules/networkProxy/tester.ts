import { NetworkProxySettings } from '@lobechat/electron-client-ipc';
import { fetch, getGlobalDispatcher, setGlobalDispatcher } from 'undici';

import { createLogger } from '@/utils/logger';

import { ProxyDispatcherManager } from './dispatcher';
import { ProxyUrlBuilder } from './urlBuilder';
import { ProxyConfigValidator } from './validator';

// Create logger
const logger = createLogger('modules:networkProxy:tester');

/**
 * 代理连接测试结果
 */
export interface ProxyTestResult {
  message?: string;
  responseTime?: number;
  success: boolean;
}

/**
 * 代理连接测试器
 */
export class ProxyConnectionTester {
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
        message: errorMessage,
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
      logger.debug(`Testing proxy with URL: ${proxyUrl}`);

      const agent = ProxyDispatcherManager.createProxyAgent(config.proxyType, proxyUrl);

      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

      // 临时设置代理进行测试
      const originalDispatcher = getGlobalDispatcher();
      setGlobalDispatcher(agent);

      try {
        const response = await fetch(testUrl, {
          dispatcher: agent,
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
        logger.info(`Proxy test successful, response time: ${responseTime}ms`);

        return {
          responseTime,
          success: true,
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      } finally {
        // 恢复原来的 dispatcher
        setGlobalDispatcher(originalDispatcher);
        // 清理临时创建的代理 agent
        if (agent && typeof agent.destroy === 'function') {
          try {
            await agent.destroy();
          } catch (error) {
            logger.warn('Failed to destroy test agent:', error);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(`Proxy test failed: ${errorMessage}`, error);

      return {
        message: `Proxy test failed: ${errorMessage}`,
        success: false,
      };
    }
  }
}
