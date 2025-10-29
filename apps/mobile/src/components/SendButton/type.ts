import type { ButtonProps } from '../Button';

export interface SendButtonProps extends Omit<ButtonProps, 'onPress' | 'icon'> {
  /**
   * 是否正在生成消息
   * @description 为 true 时显示停止按钮，为 false 时显示发送按钮
   */
  generating?: boolean;

  /**
   * 点击发送按钮的回调
   */
  onSend?: () => void;

  /**
   * 点击停止按钮的回调
   */
  onStop?: () => void;
}
