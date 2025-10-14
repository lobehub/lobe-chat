import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, TouchableOpacityProps, ViewStyle } from 'react-native';

import type { PresetColorKey } from '@/components/styles';

export type ButtonType = 'primary' | 'default' | 'text' | 'link' | 'dashed';
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type ButtonColor = 'default' | 'primary' | 'danger' | PresetColorKey;
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonShape = 'default' | 'circle';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  block?: boolean;
  children?: ReactNode;
  color?: ButtonColor;
  danger?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  onPress?: () => void;
  shape?: ButtonShape;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  type?: ButtonType;
  variant?: ButtonVariant;
}
