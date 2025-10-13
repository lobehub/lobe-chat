import type { ReactNode } from 'react';
import type { TextProps as RNTextProps, TextStyle } from 'react-native';

export type TextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p';

export type TextType = 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'auto';

export type EllipsisConfig =
  | boolean
  | {
      rows?: number;
      suffix?: string;
    };

export interface TextProps extends RNTextProps {
  /**
   * 文本对齐方式
   */
  align?: TextAlign;
  /**
   * 标签类型
   */
  as?: TextTag;
  /**
   * 文本内容
   */
  children?: ReactNode;
  /**
   * 是否代码样式
   * @default false
   */
  code?: boolean;
  /**
   * 自定义颜色
   */
  color?: string;
  /**
   * 是否删除线
   * @default false
   */
  delete?: boolean;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 省略号配置
   */
  ellipsis?: EllipsisConfig;
  /**
   * 字体大小
   */
  fontSize?: number;
  /**
   * 是否斜体
   * @default false
   */
  italic?: boolean;
  /**
   * 是否加粗
   * @default false
   */
  strong?: boolean;
  /**
   * 文本类型（语义化颜色）
   */
  type?: TextType;
  /**
   * 是否下划线
   * @default false
   */
  underline?: boolean;
  /**
   * 字重
   */
  weight?: TextStyle['fontWeight'];
}
