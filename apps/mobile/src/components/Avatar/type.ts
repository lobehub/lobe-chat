import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface AvatarProps {
  /**
   * 替代文本，用于无障碍
   */
  alt?: string;
  /**
   * 是否启用动画
   * @default false
   */
  animation?: boolean;
  /**
   * 头像图片URL或Emoji
   */
  avatar?: string | ReactNode;
  /**
   * 背景颜色
   */
  backgroundColor?: string;
  /**
   * 头像尺寸，默认为32
   */
  size?: number;
  /**
   * 自定义样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @description The title text to display if avatar is not provided
   */
  title?: string;
}
