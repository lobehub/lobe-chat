/**
 * 快捷键操作类型枚举
 */
export const ShortcutActionEnum = {
  /**
   * 显示/隐藏主窗口
   */
  showMainWindow: 'showMainWindow',
} as const;

export type ShortcutActionType = (typeof ShortcutActionEnum)[keyof typeof ShortcutActionEnum];

/**
 * 默认快捷键配置
 */
export const DEFAULT_SHORTCUTS_CONFIG: Record<ShortcutActionType, string> = {
  [ShortcutActionEnum.showMainWindow]: 'Control+E',
};
