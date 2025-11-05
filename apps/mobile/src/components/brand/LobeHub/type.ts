import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export interface LobeHubProps extends ViewProps {
  /**
   * 额外的文字内容，显示在 Logo 右侧
   */
  extra?: ReactNode;

  /**
   * Logo 的尺寸
   * @default 32
   */
  size?: number;

  /**
   * Logo 的风格类型
   * @default '3d'
   */
  type?: '3d' | 'flat' | 'mono' | 'text' | 'combine';
}
