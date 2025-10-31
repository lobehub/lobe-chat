export type ToastType = 'success' | 'error' | 'info' | 'loading' | 'warning';

export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  duration?: number;
  id: string;
  index: number;
  message: string;
  onClose?: (id: string) => void;
  position?: ToastPosition;
  showCloseButton?: boolean;
  type: ToastType;
}

export interface ToastItemInternal {
  duration?: number;
  id: string;
  message: string;
  onClose?: () => void;
  position?: ToastPosition;
  type: ToastType;
}

export type ToastUpdateConfig = Partial<Omit<ToastItemInternal, 'id'>>;
