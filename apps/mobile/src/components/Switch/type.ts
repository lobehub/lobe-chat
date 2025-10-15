import type { SwitchProps as RNSwitchProps } from 'react-native';

export interface SwitchProps
  extends Pick<RNSwitchProps, 'style' | 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange: RNSwitchProps['onValueChange'];
  size?: 'small' | 'default' | 'large';
}
