import type { ReactNode } from 'react';
import type { DimensionValue, PressableProps } from 'react-native';

export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export interface FlexboxProps extends PressableProps {
  align?: AlignItems;
  children?: ReactNode;
  flex?: number | undefined;
  gap?: number | string | undefined;
  glass?: boolean;
  height?: DimensionValue | undefined;
  horizontal?: boolean;
  justify?: JustifyContent;
  onLongPress?: PressableProps['onLongPress'];
  onPress?: PressableProps['onPress'];
  padding?: DimensionValue | undefined;
  paddingBlock?: DimensionValue | undefined;
  paddingInline?: DimensionValue | undefined;
  pressableStyle?: PressableProps['style'];
  width?: DimensionValue | undefined;
  wrap?: FlexWrap;
}
