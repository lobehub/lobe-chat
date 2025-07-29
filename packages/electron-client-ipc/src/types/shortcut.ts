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

export interface ShortcutUpdateResult {
  errorType?:
    | 'INVALID_ID'
    | 'INVALID_FORMAT'
    | 'NO_MODIFIER'
    | 'CONFLICT'
    | 'SYSTEM_OCCUPIED'
    | 'UNKNOWN';
  success: boolean;
}
