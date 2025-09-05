import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:DownloadCtr');

/**
 * 下载控制器
 * 处理桌面应用的下载相关功能，包括自动更新通知设置
 */
export default class DownloadCtr extends ControllerModule {
  /**
   * 获取自动更新通知设置
   */
  @ipcClientEvent('getAutoUpdateNotificationEnabled')
  async getAutoUpdateNotificationEnabled(): Promise<boolean> {
    try {
      const enabled = this.app.storeManager.get('autoUpdateNotificationEnabled', true);
      logger.debug('Retrieved auto update notification setting:', enabled);
      return enabled;
    } catch (error) {
      logger.error('Failed to get auto update notification setting:', error);
      return true; // 默认启用
    }
  }

  /**
   * 设置自动更新通知
   */
  @ipcClientEvent('setAutoUpdateNotificationEnabled')
  async setAutoUpdateNotificationEnabled(enabled: boolean): Promise<void> {
    try {
      this.app.storeManager.set('autoUpdateNotificationEnabled', enabled);
      logger.info('Auto update notification setting updated:', enabled);
    } catch (error) {
      logger.error('Failed to set auto update notification setting:', error);
      throw error;
    }
  }
}
