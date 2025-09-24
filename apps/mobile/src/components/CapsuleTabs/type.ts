import { StyleProp, ViewStyle } from 'react-native';
import { IconRenderable } from '../Icon';

export type CapsuleTabsSize = 'large' | 'middle' | 'small';

export interface CapsuleTabItem {
  icon?: IconRenderable;
  key: string;
  label: string;
}

export interface CapsuleTabsProps {
  items: CapsuleTabItem[];
  onSelect: (key: string) => void;
  selectedKey: string;
  showsHorizontalScrollIndicator?: boolean;
  size?: CapsuleTabsSize;
  style?: StyleProp<ViewStyle>;
}
