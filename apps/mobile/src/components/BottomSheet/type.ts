import type {
  BottomSheetBackdropProps,
  BottomSheetProps as GorhomBottomSheetProps,
} from '@gorhom/bottom-sheet';
import type { FC, ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface BottomSheetProps {
  /**
   * 动画配置
   */
  animationConfigs?: GorhomBottomSheetProps['animationConfigs'];

  /**
   * 背景遮罩组件
   */
  backdropComponent?: FC<BottomSheetBackdropProps>;

  /**
   * 底部抽屉的内容
   */
  children?: ReactNode;

  /**
   * 容器样式
   */
  containerStyle?: ViewStyle;
  /**
   * 内容容器样式
   */
  contentContainerStyle?: ViewStyle;

  /**
   * 是否启用背景遮罩
   * @default true
   */
  enableBackdrop?: boolean;

  /**
   * 是否启用手势关闭
   * @default true
   */
  enablePanDownToClose?: boolean;

  /**
   * 初始快照点索引
   * @default 0
   */
  initialSnapIndex?: number;

  /**
   * 变化回调
   */
  onChange?: (open: boolean) => void;

  /**
   * 关闭回调
   */
  onClose?: () => void;

  /**
   * 打开状态
   */
  open?: boolean;

  /**
   * 是否显示关闭按钮
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * 快照点位置，默认为 ['50%', '90%']
   * 可以是百分比字符串或数字（像素）
   */
  snapPoints?: (string | number)[];

  /**
   * 底部抽屉样式
   */
  style?: ViewStyle;

  /**
   * 底部抽屉标题
   */
  title?: string | ReactNode;
}
