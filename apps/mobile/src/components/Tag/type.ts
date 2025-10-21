import type { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

import type { IconProps } from '@/components/Icon';
import type {
  PresetColorKey,
  PresetStatusColorKey,
} from '@/components/styles/theme/interface/presetColors';

import type { TextProps } from '../Text';

export type TagColor = PresetColorKey | PresetStatusColorKey | string;

export interface TagProps {
  /**
   * 是否显示边框（已废弃，请使用 variant）
   * @deprecated
   */
  border?: boolean;

  /**
   * 子元素内容
   */
  children?: ReactNode;

  /**
   * 标签颜色，支持预设颜色、系统状态颜色或十六进制颜色值
   */
  color?: TagColor;

  /**
   * 左侧图标
   */
  icon?: IconProps['icon'];

  iconProps?: Omit<IconProps, 'icon'>;

  iconSize?: IconProps['size'];

  /**
   * 点击事件
   */
  onPress?: () => void;

  /**
   * 标签尺寸
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 自定义样式
   */
  style?: ViewStyle;
  textProps?: Omit<TextProps, 'style'>;

  /**
   * 文本样式
   */
  textStyle?: TextProps['style'];
  /**
   * 样式变体
   * @default 'filled'
   */
  variant?: 'filled' | 'outlined' | 'borderless';
}
