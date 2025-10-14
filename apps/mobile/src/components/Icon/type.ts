import type { LucideIcon, LucideProps } from 'lucide-react-native';
import type { FC, ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

export interface IconSizeConfig extends Pick<LucideProps, 'strokeWidth' | 'absoluteStrokeWidth'> {
  size?: number | string;
}
export type IconSizeType = 'large' | 'middle' | 'small';
export type IconSize = number | IconSizeType | IconSizeConfig;

export type LucideIconProps = Pick<
  LucideProps,
  'fill' | 'fillRule' | 'fillOpacity' | 'color' | 'focusable'
>;

export interface IconProps extends LucideIconProps {
  color?: ColorValue;
  icon: LucideIcon | FC<any> | ReactNode;
  size?: IconSize;
  spin?: boolean;
  style?: StyleProp<ViewStyle>;
}
