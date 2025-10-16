import type { ReactNode } from 'react';
import { TextInputProps as RNTextInputProps, StyleProp, ViewStyle } from 'react-native';

import type { BlockProps } from '../Block';

export type InputSize = 'large' | 'middle' | 'small';

export type InputVariant = BlockProps['variant'];

export interface InputProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  disabled?: boolean;
  prefix?: ReactNode;
  size?: InputSize;
  style?: StyleProp<ViewStyle>;
  suffix?: ReactNode;
  textStyle?: RNTextInputProps['style'];
  variant?: InputVariant;
}

export interface TextAreaProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  disabled?: boolean;
  size?: InputSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: RNTextInputProps['style'];
  variant?: InputVariant;
}
