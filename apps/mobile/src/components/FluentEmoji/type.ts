import type { EmojiType } from './utils';

export interface FluentEmojiProps {
  /**
   * 要显示的表情符号
   */
  emoji: string;

  /**
   * 表情符号尺寸
   * @default 32
   */
  size?: number;

  /**
   * @description The type of the FluentUI emoji set to be used
   * @default '3d'
   */
  type?: EmojiType;
}
