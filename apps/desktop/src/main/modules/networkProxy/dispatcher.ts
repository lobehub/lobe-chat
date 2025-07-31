import { NetworkProxySettings } from '@lobechat/electron-client-ipc';
import { Agent, ProxyAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';

import { createLogger } from '@/utils/logger';

import { ProxyUrlBuilder } from './urlBuilder';

// Create logger
const logger = createLogger('modules:networkProxy:dispatcher');

/**
 * 代理管理器
 */
export class ProxyDispatcherManager {
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
        // 创建一个新的默认 Agent 来替代代理
        setGlobalDispatcher(new Agent());
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
  static createProxyAgent(proxyType: string, proxyUrl: string) {
    try {
      // undici 的 ProxyAgent 支持 http, https 和 socks5
      return new ProxyAgent({ uri: proxyUrl });
    } catch (error) {
      logger.error(`Failed to create proxy agent for ${proxyType}:`, error);
      throw new Error(
        `Failed to create proxy agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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
