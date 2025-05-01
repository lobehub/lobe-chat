/**
 * 显示托盘通知的参数
 */
export interface ShowTrayNotificationParams {
  /**
   * 通知内容
   */
  content: string;

  /**
   * 图标类型
   */
  iconType?: 'info' | 'warning' | 'error' | 'none';

  /**
   * 通知标题
   */
  title: string;
}

/**
 * 更新托盘图标的参数
 */
export interface UpdateTrayIconParams {
  /**
   * 图标路径（相对于资源目录）
   */
  iconPath: string;
}

/**
 * 更新托盘提示文本的参数
 */
export interface UpdateTrayTooltipParams {
  /**
   * 提示文本
   */
  tooltip: string;
}
