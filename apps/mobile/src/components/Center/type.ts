import type { ReactNode } from 'react';
import type { DimensionValue, PressableProps } from 'react-native';

import type { AlignItems, FlexWrap, JustifyContent } from '../Flexbox';

export interface CenterProps extends PressableProps {
  align?: AlignItems;
  children?: ReactNode;
  flex?: number | undefined;
  gap?: number | string | undefined;
  height?: DimensionValue | undefined;
  horizontal?: boolean;
  justify?: JustifyContent;
  onLongPress?: PressableProps['onLongPress'];
  onPress?: PressableProps['onPress'];
  padding?: DimensionValue | undefined;
  paddingBlock?: DimensionValue | undefined;
  paddingInline?: DimensionValue | undefined;
  width?: DimensionValue | undefined;
  wrap?: FlexWrap;
}
