import type { ReactNode } from 'react';
import { TextInputProps as RNTextInputProps, StyleProp, ViewStyle } from 'react-native';

import type { BlockProps } from '../Block';

export type InputSize = 'large' | 'middle' | 'small';

export type InputVariant = BlockProps['variant'];

export interface InputProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  block?: boolean;
  disabled?: boolean;
  glass?: boolean;
  prefix?: ReactNode;
  size?: InputSize;
  style?: StyleProp<ViewStyle>;
  suffix?: ReactNode;
  textStyle?: RNTextInputProps['style'];
  variant?: InputVariant;
}

export interface InputSearchProps extends InputProps {
  /**
   * 防抖等待时间（毫秒）
   * @default 300
   */
  debounceWait?: number;
  /**
   * 搜索回调，会被防抖处理
   * 如果不传此回调，则不会进行防抖
   */
  onSearch?: (text: string) => void;
}

export interface TextAreaProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  block?: boolean;
  disabled?: boolean;
  size?: InputSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: RNTextInputProps['style'];
  variant?: InputVariant;
}
