import { ReactNode } from 'react';

export interface DropdownIconConfig {
  /**
   * iOS SF Symbol 图标名称
   *
   * 注意：由于基于原生菜单 API，只支持系统图标，不支持自定义 React 组件
   *
   * 常用图标：
   * - 'doc.on.doc' - 复制
   * - 'pencil' - 编辑
   * - 'trash' - 删除
   * - 'arrow.clockwise' - 刷新
   * - 'square.and.arrow.up' - 分享
   * - 'gear' - 设置
   * - 'star' - 星标
   *
   * 更多图标: https://developer.apple.com/sf-symbols/
   */
  name: string;
  /**
   * 图标尺寸
   * @default 18
   */
  pointSize?: number;
}

export interface DropdownOptionItem {
  /**
   * 是否为破坏性操作（显示为红色）
   */
  destructive?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
  /**
   * 菜单项图标配置
   */
  icon?: DropdownIconConfig;
  /**
   * 唯一标识
   */
  key: string;
  /**
   * 点击回调
   */
  onSelect?: () => void;
  /**
   * 是否在选择后关闭菜单
   * @default true
   */
  shouldDismissMenuOnSelect?: boolean;
  /**
   * 显示文本
   */
  title: string;
}

export type DropdownPlacement =
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'top'
  | 'topLeft'
  | 'topRight';

export interface DropdownProps {
  /**
   * 触发元素
   */
  children: ReactNode;
  /**
   * 菜单打开/关闭回调
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 菜单选项列表
   */
  options: DropdownOptionItem[];
  /**
   * 菜单弹出位置
   *
   * ⚠️ 注意：由于基于原生平台菜单 API，实际弹出位置由系统自动控制，
   * 此属性可能不会生效。系统会根据触发元素位置和屏幕空间自动调整菜单位置。
   *
   * @default 'bottom'
   */
  placement?: DropdownPlacement;
  /**
   * 触发方式
   * - 'press': 点击触发
   * - 'longPress': 长按触发（默认）
   * @default 'longPress'
   */
  trigger?: 'press' | 'longPress';
}
