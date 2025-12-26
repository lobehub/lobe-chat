import {
  ShowTrayNotificationParams,
  UpdateTrayIconParams,
  UpdateTrayTooltipParams,
} from '../types';

export interface TrayDispatchEvents {
  /**
   * Show tray notification
   * @param params Notification parameters
   * @returns Operation result
   */
  showTrayNotification: (params: ShowTrayNotificationParams) => {
    error?: string;
    success: boolean;
  };

  /**
   * Update tray icon
   * @param params Icon parameters
   * @returns Operation result
   */
  updateTrayIcon: (params: UpdateTrayIconParams) => { error?: string; success: boolean };

  /**
   * Update tray tooltip text
   * @param params Tooltip text parameters
   * @returns Operation result
   */
  updateTrayTooltip: (params: UpdateTrayTooltipParams) => { error?: string; success: boolean };
}
