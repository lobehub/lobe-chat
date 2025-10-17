import type { ComponentType } from 'react';
import { ReactNode } from 'react';
import {
  ColorValue,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { IconProps } from '../Icon';

export interface PageContainerProps {
  backgroundColor?: ColorValue | [ColorValue, ColorValue, ...ColorValue[]];
  children?: ReactNode;
  extra?: ReactNode;
  largeTitleEnabled?: boolean;
  left?: ReactNode;
  loading?: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTitlePress?: PressableProps['onPress'];
  scrollComponent?: ComponentType<any>;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
  titleIcon?: IconProps['icon'];
}
