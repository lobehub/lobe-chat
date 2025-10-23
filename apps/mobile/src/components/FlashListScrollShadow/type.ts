import type { FlashListProps } from '@shopify/flash-list';

export interface FlashListScrollShadowProps<T>
  extends Omit<
    FlashListProps<T>,
    'horizontal' | 'showsHorizontalScrollIndicator' | 'showsVerticalScrollIndicator'
  > {
  /**
   * Item estimated size for FlashList performance optimization
   */
  estimatedItemSize: number;
  /**
   * 是否隐藏滚动条
   * @default false
   */
  hideScrollBar?: boolean;
  /**
   * 是否倒置列表（从底部开始渲染）
   * 适用于聊天应用，最新消息在底部
   * @default false
   */
  inverted?: boolean;
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
   * Ref to the underlying FlashList
   */
  ref?: any;
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
