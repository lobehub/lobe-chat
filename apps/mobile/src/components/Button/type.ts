import type { StyleProp, TextStyle } from 'react-native';

import type { BlockProps } from '@/components/Block';
import type { IconProps } from '@/components/Icon';
import type { TextProps } from '@/components/Text';
import type { PresetColorKey } from '@/components/styles';

export type ButtonType = 'primary' | 'default' | 'text' | 'link';
export type ButtonVariant = 'filled' | 'outlined' | 'borderless';
export type ButtonColor = 'default' | 'primary' | 'danger' | PresetColorKey;
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonShape = 'default' | 'circle';

export interface ButtonProps extends Omit<BlockProps, 'variant'> {
  block?: boolean;
  color?: ButtonColor;
  danger?: boolean;
  icon?: IconProps['icon'];
  iconProps?: Omit<IconProps, 'icon'>;
  loading?: boolean;
  shape?: ButtonShape;
  size?: ButtonSize;
  textProps?: Omit<TextProps, 'children'>;
  textStyle?: StyleProp<TextStyle>;
  type?: ButtonType;
  variant?: ButtonVariant;
}
