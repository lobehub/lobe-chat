import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { IconRenderable } from '@/components/Icon';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  action?: ReactNode;
  closable?: boolean;
  closeIcon?: IconRenderable;
  description?: ReactNode;
  icon?: ReactNode;
  message: ReactNode;
  onClose?: () => void;
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  type?: AlertType;
}
