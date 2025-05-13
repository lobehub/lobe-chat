import {
  ShowTrayNotificationParams,
  UpdateTrayIconParams,
  UpdateTrayTooltipParams,
} from '@lobechat/electron-client-ipc';

import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent, shortcut } from './index';

// 创建日志记录器
const logger = createLogger('controllers:TrayMenuCtr');

export default class TrayMenuCtr extends ControllerModule {
  /**
   * 使用快捷键切换窗口可见性
   */
  @shortcut('toggleMainWindow')
  async toggleMainWindow() {
    logger.debug('通过快捷键切换主窗口可见性');
    const mainWindow = this.app.browserManager.getMainWindow();
    mainWindow.toggleVisible();
  }

  /**
   * 显示托盘气泡通知
   * @param options 气泡选项
   * @returns 操作结果
   */
  @ipcClientEvent('showTrayNotification')
  async showNotification(options: ShowTrayNotificationParams) {
    logger.debug('显示托盘气泡通知');

    if (process.platform === 'win32') {
      const mainTray = this.app.trayManager.getMainTray();

      if (mainTray) {
        mainTray.displayBalloon({
          content: options.content,
          iconType: options.iconType || 'info',
          title: options.title,
        });

        return { success: true };
      }
    }

    return {
      error: '托盘通知仅在 Windows 平台支持',
      success: false
    };
  }

  /**
   * 更新托盘图标
   * @param options 图标选项
   * @returns 操作结果
   */
  @ipcClientEvent('updateTrayIcon')
  async updateTrayIcon(options: UpdateTrayIconParams) {
    logger.debug('更新托盘图标');

    if (process.platform === 'win32') {
      const mainTray = this.app.trayManager.getMainTray();

      if (mainTray && options.iconPath) {
        try {
          mainTray.updateIcon(options.iconPath);
          return { success: true };
        } catch (error) {
          logger.error('更新托盘图标失败:', error);
          return {
            error: String(error),
            success: false
          };
        }
      }
    }

    return {
      error: '托盘功能仅在 Windows 平台支持',
      success: false
    };
  }

  /**
   * 更新托盘提示文本
   * @param options 提示文本选项
   * @returns 操作结果
   */
  @ipcClientEvent('updateTrayTooltip')
  async updateTrayTooltip(options: UpdateTrayTooltipParams) {
    logger.debug('更新托盘提示文本');

    if (process.platform === 'win32') {
      const mainTray = this.app.trayManager.getMainTray();

      if (mainTray && options.tooltip) {
        mainTray.updateTooltip(options.tooltip);
        return { success: true };
      }
    }

    return {
      error: '托盘功能仅在 Windows 平台支持',
      success: false
    };
  }
}
