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
import { NativeSafeAreaViewProps } from 'react-native-safe-area-context/src/SafeArea.types';
import type { SearchBarProps } from 'react-native-screens';

import { FlexboxProps } from '../Flexbox';
import { IconProps } from '../Icon';

export interface NativePageContainerProps {
  /**
   * 自动检测是否可以返回并显示返回按钮
   * 当设置为 true 时,会使用 router.canGoBack() 检测导航栈
   * @default false
   */
  autoBack?: boolean;
  backgroundColor?: ColorValue;
  children?: ReactNode;
  extra?: ReactNode;
  extraProps?: Omit<FlexboxProps, 'children'>;
  headerBackgroundColor?: ColorValue;
  largeTitleEnabled?: boolean;
  left?: ReactNode;
  leftProps?: Omit<FlexboxProps, 'children'>;
  loading?: boolean;
  onBackPress?: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTitlePress?: PressableProps['onPress'];
  safeAreaProps?: Omit<NativeSafeAreaViewProps, 'children' | 'style'>;
  scrollComponent?: ComponentType<any>;
  /**
   * 搜索栏配置
   * iOS 原生搜索栏选项
   */
  searchBarOptions?: SearchBarProps;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
  titleIcon?: IconProps['icon'];
  titleProps?: Omit<FlexboxProps, 'children'>;
}
