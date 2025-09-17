import type React from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

export interface IconSizeConfig {
  blockSize?: number | string;
  borderRadius?: number | string;
  size?: number;
}

export type IconSize = number | 'small' | 'middle' | 'large' | IconSizeConfig;

export type IconComponentType = React.ComponentType<{ color?: ColorValue; size?: number }>;

export type IconRenderable = LucideIcon | React.ComponentType<any> | React.ReactNode;

export interface IconProps {
  color?: ColorValue;
  icon: IconRenderable;
  size?: IconSize;
  spin?: boolean;
  style?: StyleProp<ViewStyle>;
}
