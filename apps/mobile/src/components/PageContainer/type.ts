import type { ComponentType } from 'react';
import { ReactNode } from 'react';
import {
  ColorValue,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface PageContainerProps {
  backgroundColor?: ColorValue | [ColorValue, ColorValue, ...ColorValue[]];
  children?: ReactNode;
  extra?: ReactNode;
  largeTitleEnabled?: boolean;
  left?: ReactNode;
  loading?: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollComponent?: ComponentType<any>;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
}
