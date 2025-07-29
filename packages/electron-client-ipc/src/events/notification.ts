import { DesktopNotificationResult, ShowDesktopNotificationParams } from '../types';

export interface NotificationDispatchEvents {
  isMainWindowHidden: () => boolean;
  showDesktopNotification: (params: ShowDesktopNotificationParams) => DesktopNotificationResult;
}
