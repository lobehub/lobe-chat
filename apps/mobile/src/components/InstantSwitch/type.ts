import type { ViewStyle } from 'react-native';

export interface InstantSwitchProps {
  // 基础属性
  disabled?: boolean;
  enabled: boolean;
  loadingColor?: string;
  onChange: (enabled: boolean) => Promise<void>;
  size?: 'small' | 'default' | 'large';
  style?: ViewStyle;
  thumbColor?: string;
  trackColor?: {
    false: string;
    true: string;
  };
  trackStyle?: ViewStyle;
}
