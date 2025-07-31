import {
  DesktopNotificationResult,
  ShowDesktopNotificationParams,
} from '@lobechat/electron-client-ipc';
import { Notification, app } from 'electron';
import { macOS, windows } from 'electron-is';

import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

const logger = createLogger('controllers:NotificationCtr');

export default class NotificationCtr extends ControllerModule {
  /**
   * 在应用准备就绪后设置桌面通知
   */
  afterAppReady() {
    this.setupNotifications();
  }

  /**
   * 设置桌面通知权限和配置
   */
  private setupNotifications() {
    logger.debug('Setting up desktop notifications');

    try {
      // 检查通知支持
      if (!Notification.isSupported()) {
        logger.warn('Desktop notifications are not supported on this platform');
        return;
      }

      // 在 macOS 上，我们可能需要显式请求通知权限
      if (macOS()) {
        logger.debug('macOS detected, notification permissions should be handled by system');
      }

      // 在 Windows 上设置应用用户模型 ID
      if (windows()) {
        app.setAppUserModelId('com.lobehub.chat');
        logger.debug('Set Windows App User Model ID for notifications');
      }

      logger.info('Desktop notifications setup completed');
    } catch (error) {
      logger.error('Failed to setup desktop notifications:', error);
    }
  }
  /**
   * 显示系统桌面通知（仅当窗口隐藏时）
   */
  @ipcClientEvent('showDesktopNotification')
  async showDesktopNotification(
    params: ShowDesktopNotificationParams,
  ): Promise<DesktopNotificationResult> {
    logger.debug('收到桌面通知请求:', params);

    try {
      // 检查通知支持
      if (!Notification.isSupported()) {
        logger.warn('系统不支持桌面通知');
        return { error: 'Desktop notifications not supported', success: false };
      }

      // 检查窗口是否隐藏
      const isWindowHidden = this.isMainWindowHidden();

      if (!isWindowHidden) {
        logger.debug('主窗口可见，跳过桌面通知');
        return { reason: 'Window is visible', skipped: true, success: true };
      }

      logger.info('窗口已隐藏，显示桌面通知:', params.title);

      const notification = new Notification({
        body: params.body,
        // 添加更多配置以确保通知能正常显示
        hasReply: false,
        silent: params.silent || false,
        timeoutType: 'default',
        title: params.title,
        urgency: 'normal',
      });

      // 添加更多事件监听来调试
      notification.on('show', () => {
        logger.info('通知已显示');
      });

      notification.on('click', () => {
        logger.debug('用户点击通知，显示主窗口');
        const mainWindow = this.app.browserManager.getMainWindow();
        mainWindow.show();
        mainWindow.browserWindow.focus();
      });

      notification.on('close', () => {
        logger.debug('通知已关闭');
      });

      notification.on('failed', (error) => {
        logger.error('通知显示失败:', error);
      });

      // 使用 Promise 来确保通知显示
      return new Promise((resolve) => {
        notification.show();

        // 给通知一些时间来显示，然后检查结果
        setTimeout(() => {
          logger.info('通知显示调用完成');
          resolve({ success: true });
        }, 100);
      });
    } catch (error) {
      logger.error('显示桌面通知失败:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * 检查主窗口是否隐藏
   */
  @ipcClientEvent('isMainWindowHidden')
  isMainWindowHidden(): boolean {
    try {
      const mainWindow = this.app.browserManager.getMainWindow();
      const browserWindow = mainWindow.browserWindow;

      // 如果窗口被销毁，认为是隐藏的
      if (browserWindow.isDestroyed()) {
        return true;
      }

      // 检查窗口是否可见和聚焦
      const isVisible = browserWindow.isVisible();
      const isFocused = browserWindow.isFocused();
      const isMinimized = browserWindow.isMinimized();

      logger.debug('窗口状态检查:', { isFocused, isMinimized, isVisible });

      // 窗口隐藏的条件：不可见或最小化或失去焦点
      return !isVisible || isMinimized || !isFocused;
    } catch (error) {
      logger.error('检查窗口状态失败:', error);
      return true; // 发生错误时认为窗口隐藏，确保通知能显示
    }
  }
}
