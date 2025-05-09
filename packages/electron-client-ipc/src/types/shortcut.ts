export interface ShortcutConfig {
  /**
   * 快捷键加速器（如 CommandOrControl+E）
   */
  accelerator: string;
  /**
   * 快捷键 ID
   */
  id: string;
}
export type ShortcutActionType = Record<string, any>;
