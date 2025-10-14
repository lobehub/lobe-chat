import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

import type { IconProps } from '../Icon';

export interface SegmentedItemType {
  /**
   * 分段项的禁用状态
   */
  disabled?: boolean;
  /**
   * 分段项的显示图标
   */
  icon?: IconProps['icon'];
  /**
   * 分段项的显示文本
   */
  label?: ReactNode | string;
  /**
   * 分段项的值
   */
  value: string | number;
}

export interface SegmentedProps {
  /**
   * 将宽度调整为父元素宽度的选项
   * @default false
   */
  block?: boolean;
  /**
   * 默认选中的值
   */
  defaultValue?: string | number;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 选项变化时的回调函数
   */
  onChange?: (value: string | number) => void;
  /**
   * 数据化配置选项内容
   * @default []
   */
  options?: string[] | number[] | SegmentedItemType[];
  /**
   * 形状样式
   * @default 'default'
   */
  shape?: 'default' | 'round';
  /**
   * 控件尺寸
   * @default 'middle'
   */
  size?: 'small' | 'middle' | 'large';
  /**
   * 自定义样式
   */
  style?: ViewStyle;
  /**
   * 当前选中的值
   */
  value?: string | number;
  /**
   * 排列方向
   * @default false
   */
  vertical?: boolean;
}
