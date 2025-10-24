import type { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import type { BlockProps } from '../Block';
import type { BottomSheetProps } from '../BottomSheet';
import type { IconProps } from '../Icon';
import type { TextProps } from '../Text';

export type SelectSize = 'large' | 'middle' | 'small';

export type SelectVariant = BlockProps['variant'];

export interface SelectOptionItem {
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 选项图标
   */
  icon?: IconProps['icon'];
  iconSize?: number;
  /**
   * 选项标题
   */
  title: string | ReactNode;
  /**
   * 选项值
   */
  value: string | number;
}

export interface SelectProps {
  bottomSheetProps?: Partial<Omit<BottomSheetProps, 'open' | 'onClose' | 'title' | 'children'>>;
  /**
   * 默认选中的值
   */
  defaultValue?: string | number;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 值变化回调
   */
  onChange?: (value: string | number) => void;
  /**
   * 自定义选项渲染
   */
  optionRender?: (item: SelectOptionItem, index: number) => ReactNode;
  /**
   * 选项列表
   */
  options: SelectOptionItem[];
  /**
   * 尺寸
   * @default 'middle'
   */
  size?: SelectSize;
  /**
   * 自定义样式
   */
  style?: StyleProp<ViewStyle>;
  textProps?: Partial<TextProps>;
  /**
   * BottomSheet 标题
   */
  title?: string;
  /**
   * 受控模式的值
   */
  value?: string | number;
  /**
   * 样式变体
   */
  variant?: SelectVariant;
}
