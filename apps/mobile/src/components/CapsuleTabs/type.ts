import { StyleProp, ViewStyle } from 'react-native';

import type { IconProps } from '../Icon';

export type CapsuleTabsSize = 'large' | 'middle' | 'small';

export interface CapsuleTabItem {
  icon?: IconProps['icon'];
  key: string;
  label: string;
}

export interface CapsuleTabsProps {
  /**
   * 是否启用滚动阴影效果
   * @default true
   */
  enableScrollShadow?: boolean;
  items: CapsuleTabItem[];
  onSelect: (key: string) => void;
  selectedKey: string;
  size?: CapsuleTabsSize;
  style?: StyleProp<ViewStyle>;
}
