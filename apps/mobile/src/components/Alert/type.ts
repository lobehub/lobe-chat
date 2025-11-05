import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { IconProps } from '../Icon';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /**
   * 操作按钮区域
   */
  action?: ReactNode;
  /**
   * 是否可关闭
   * @default false
   */
  closable?: boolean;
  /**
   * 自定义关闭图标
   */
  closeIcon?: IconProps['icon'];
  /**
   * 文字是否使用类型对应的主题颜色
   * @default true
   */
  colorfulText?: boolean;
  /**
   * 警告提示的辅助性文字介绍
   */
  description?: ReactNode;
  /**
   * 额外内容（可展开/隔离显示）
   */
  extra?: ReactNode;
  /**
   * 额外内容默认是否展开
   * @default false
   */
  extraDefaultExpand?: boolean;
  /**
   * 额外内容是否隔离显示（独立的 Alert）
   */
  extraIsolate?: boolean;
  /**
   * 自定义图标
   */
  icon?: ReactNode;
  /**
   * 警告提示内容
   */
  message: ReactNode;
  /**
   * 关闭时触发的回调函数
   */
  onClose?: () => void;
  /**
   * 是否显示图标
   * @default true
   */
  showIcon?: boolean;
  /**
   * 自定义样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * 指定警告提示的样式
   * @default 'info'
   */
  type?: AlertType;
  /**
   * 样式变体
   * @default 'filled'
   */
  variant?: 'filled' | 'outlined' | 'borderless';
}
