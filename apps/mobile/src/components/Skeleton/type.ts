import type { ReactNode } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { FlexboxProps } from '../Flexbox';

export interface SkeletonProps extends FlexboxProps {
  /** Display animated shimmer effect */
  animated?: boolean;
  /** Show skeleton avatar */
  avatar?: boolean | { shape?: 'circle' | 'square'; size?: number };
  /** Content to show when loading is false */
  children?: ReactNode;
  fontSize?: number;
  /** Show loading state */
  loading?: boolean;
  /** Show skeleton paragraph */
  paragraph?:
    | boolean
    | { fontSize?: number; rows?: number; width?: DimensionValue | DimensionValue[] };
  /** Custom style for skeleton container */
  style?: StyleProp<ViewStyle>;
  /** Show skeleton title */
  title?: boolean | { width?: DimensionValue };
}
