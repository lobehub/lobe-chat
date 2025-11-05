import type { SvgProps } from 'react-native-svg';

export interface BrandLoadingProps extends Omit<SvgProps, 'children' | 'color'> {
  /**
   * Logo 颜色
   * @default 'currentColor'
   */
  color?: string;

  /**
   * Logo 尺寸（高度）
   * @default 64
   */
  size?: number;
}
