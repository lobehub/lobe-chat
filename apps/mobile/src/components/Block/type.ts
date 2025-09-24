import type { ReactNode, Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { FlexBoxProps } from '../FlexBox';

// 定义 Block 的变体类型
export interface BlockVariantProps {
  clickable?: boolean;
  glass?: boolean;
  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}

export interface BlockProps extends Omit<FlexBoxProps, 'style'>, BlockVariantProps {
  /**
   * 子元素
   */
  children?: ReactNode;
  /**
   * 点击回调函数
   */
  onPress?: () => void;
  /**
   * 引用
   */
  ref?: Ref<any>;
  /**
   * 自定义样式
   */
  style?: StyleProp<ViewStyle>;
}
