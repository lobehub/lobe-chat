import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export interface MaskShadowProps extends ViewProps {
  children?: ReactNode;
  /**
   * 阴影位置
   * @default 'bottom'
   */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * 阴影大小 (0-100 的百分比)
   * @default 40
   */
  size?: number;
}
