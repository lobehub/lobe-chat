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

import { FlexboxProps } from '../Flexbox';
import { IconProps } from '../Icon';

export interface PageContainerProps {
  backgroundColor?: ColorValue | [ColorValue, ColorValue, ...ColorValue[]];
  children?: ReactNode;
  extra?: ReactNode;
  extraProps?: Omit<FlexboxProps, 'children'>;
  largeTitleEnabled?: boolean;
  left?: ReactNode;
  leftProps?: Omit<FlexboxProps, 'children'>;
  loading?: boolean;
  onBackPress?: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTitlePress?: PressableProps['onPress'];
  scrollComponent?: ComponentType<any>;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
  titleIcon?: IconProps['icon'];
  titleProps?: Omit<FlexboxProps, 'children'>;
}
