import {
  ShowTrayNotificationParams,
  UpdateTrayIconParams,
  UpdateTrayTooltipParams,
} from '../types';

export interface TrayDispatchEvents {
  /**
   * 显示托盘通知
   * @param params 通知参数
   * @returns 操作结果
   */
  showTrayNotification: (params: ShowTrayNotificationParams) => {
    error?: string;
    success: boolean;
  };

  /**
   * 更新托盘图标
   * @param params 图标参数
   * @returns 操作结果
   */
  updateTrayIcon: (params: UpdateTrayIconParams) => { error?: string; success: boolean };

  /**
   * 更新托盘提示文本
   * @param params 提示文本参数
   * @returns 操作结果
   */
  updateTrayTooltip: (params: UpdateTrayTooltipParams) => { error?: string; success: boolean };
}
