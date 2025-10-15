import type { ComponentType } from 'react';
import { ReactNode } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';

export interface PageContainerProps {
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
