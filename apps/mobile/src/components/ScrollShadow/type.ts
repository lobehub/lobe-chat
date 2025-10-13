import type { ReactNode } from 'react';
import type { ScrollViewProps } from 'react-native';

export interface ScrollShadowProps extends ScrollViewProps {
  children?: ReactNode;
  /**
   * 是否隐藏滚动条
   * @default false
   */
  hideScrollBar?: boolean;
  /**
   * 是否启用阴影效果
   * @default true
   */
  isEnabled?: boolean;
  /**
   * 滚动偏移量阈值
   * @default 0
   */
  offset?: number;
  /**
   * 阴影可见性变化回调
   */
  onVisibilityChange?: (visibility: {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    top?: boolean;
  }) => void;
  /**
   * 滚动方向
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * 阴影大小 (0-100 的百分比)
   * @default 40
   */
  size?: number;
  /**
   * 阴影可见性模式
   * - auto: 根据滚动状态自动显示
   * - always: 始终显示
   * - never: 从不显示
   * @default 'auto'
   */
  visibility?: 'auto' | 'always' | 'never';
}
