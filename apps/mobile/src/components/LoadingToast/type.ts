export interface LoadingToastProps {
  /**
   * 显示取消按钮的延迟时间（毫秒）
   * @default 3000
   */
  cancelDelay?: number;
  /**
   * 取消回调
   */
  onCancel?: () => void;
}
