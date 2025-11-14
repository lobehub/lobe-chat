import {
  DesktopNotificationResult,
  ShowDesktopNotificationParams,
  dispatch,
} from '@lobechat/electron-client-ipc';

/**
 * Desktop notification service
 */
export class DesktopNotificationService {
  /**
   * Show desktop notification (only when window is hidden)
   * @param params Notification parameters
   * @returns Notification result
   */
  async showNotification(
    params: ShowDesktopNotificationParams,
  ): Promise<DesktopNotificationResult> {
    return dispatch('showDesktopNotification', params);
  }

  /**
   * Check if main window is hidden
   * @returns Whether it is hidden
   */
  async isMainWindowHidden(): Promise<boolean> {
    return dispatch('isMainWindowHidden');
  }
}

export const desktopNotificationService = new DesktopNotificationService();
