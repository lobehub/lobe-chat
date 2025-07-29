import {
  DesktopNotificationResult,
  ShowDesktopNotificationParams,
  dispatch,
} from '@lobechat/electron-client-ipc';

/**
 * 桌面通知服务
 */
export class DesktopNotificationService {
  /**
   * 显示桌面通知（仅在窗口隐藏时）
   * @param params 通知参数
   * @returns 通知结果
   */
  async showNotification(
    params: ShowDesktopNotificationParams,
  ): Promise<DesktopNotificationResult> {
    return dispatch('showDesktopNotification', params);
  }

  /**
   * 检查主窗口是否隐藏
   * @returns 是否隐藏
   */
  async isMainWindowHidden(): Promise<boolean> {
    return dispatch('isMainWindowHidden');
  }
}

export const desktopNotificationService = new DesktopNotificationService();
