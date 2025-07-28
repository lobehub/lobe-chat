/**
 * 快捷键操作类型枚举
 */
export const ShortcutActionEnum = {
  openSettings: 'openSettings',
  /**
   * 显示/隐藏主窗口
   */
  showApp: 'showApp',
} as const;

export type ShortcutActionType = (typeof ShortcutActionEnum)[keyof typeof ShortcutActionEnum];

/**
 * 默认快捷键配置
 */
export const DEFAULT_SHORTCUTS_CONFIG: Record<ShortcutActionType, string> = {
  [ShortcutActionEnum.showApp]: 'Control+E',
  [ShortcutActionEnum.openSettings]: 'CommandOrControl+,',
};
