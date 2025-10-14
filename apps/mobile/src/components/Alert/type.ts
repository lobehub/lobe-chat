import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { IconProps } from '../Icon';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  action?: ReactNode;
  closable?: boolean;
  closeIcon?: IconProps['icon'];
  description?: ReactNode;
  icon?: ReactNode;
  message: ReactNode;
  onClose?: () => void;
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  type?: AlertType;
}
