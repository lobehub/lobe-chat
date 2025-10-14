import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface TooltipProps {
  /** 是否显示箭头 */
  arrow?: boolean;
  /** 子组件 */
  children: ReactNode;
  /** 气泡框颜色 */
  color?: string;
  /** 显示隐藏的回调 */
  onVisibleChange?: (visible: boolean) => void;
  /** 自定义样式 */
  overlayStyle?: StyleProp<ViewStyle>;
  /** 气泡框位置 */
  placement?: TooltipPlacement;
  /** 文字样式 */
  textStyle?: StyleProp<TextStyle>;
  /** 提示文字或内容 */
  title: string | ReactNode;
  /** 触发行为 */
  trigger?: TooltipTrigger;
  /** 是否可见（受控模式） */
  visible?: boolean;
  /** z-index */
  zIndex?: number;
}

export type TooltipPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

export type TooltipTrigger = 'click' | 'longPress' | 'none';
