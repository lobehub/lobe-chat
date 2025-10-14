import type { ReactNode } from 'react';

export interface SpaceProps {
  /**
   * 对齐方式
   */
  align?: SpaceAlign;
  /**
   * 节点之间的内容
   */
  children?: ReactNode;
  /**
   * 间距方向
   * @default horizontal
   */
  direction?: SpaceDirection;
  /**
   * 间距大小
   * @default small
   */
  size?: SpaceSize | [SpaceSize, SpaceSize];
  /**
   * 设置分隔符
   */
  split?: ReactNode;
  /**
   * 自定义样式
   */
  style?: any;
  /**
   * 是否自动换行，仅在 horizontal 时有效
   * @default false
   */
  wrap?: boolean;
}

export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

export type SpaceDirection = 'vertical' | 'horizontal';

export type SpaceSize = 'small' | 'middle' | 'large' | number;
