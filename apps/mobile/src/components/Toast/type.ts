import { Animated } from 'react-native';

export interface ToastProps {
  duration?: number;
  id: string;
  message: string;
  onClose?: (id: string) => void;
  opacity: Animated.Value;
  type: ToastType;
}

export type ToastType = 'success' | 'error' | 'info' | 'loading';
