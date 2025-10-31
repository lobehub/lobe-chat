import { ReactNode, memo, useEffect } from 'react';

import { useToast } from './InnerToastProvider';

// Global toast manager for static methods
let globalToastContext: ReturnType<typeof useToast> | null = null;

const setGlobalToastContext = (context: ReturnType<typeof useToast>) => {
  globalToastContext = context;
};

// Static methods interface
export interface ToastStatic {
  destroy: (id: string) => void;
  error: (message: string, duration?: number, onClose?: () => void) => string;
  info: (message: string, duration?: number, onClose?: () => void) => string;
  loading: (message: string, duration?: number, onClose?: () => void) => string;
  success: (message: string, duration?: number, onClose?: () => void) => string;
}

const createStaticMethod = (type: 'success' | 'error' | 'info' | 'loading') => {
  return (message: string, duration?: number, onClose?: () => void) => {
    if (!globalToastContext) {
      console.warn('Toast: ToastProvider not found. Please wrap your app with ToastProvider.');
      return '';
    }

    return globalToastContext[type](message, duration, onClose);
  };
};

// Component to set global context
export const ToastContextSetter = memo<{ children: ReactNode }>(({ children }) => {
  const toastContext = useToast();

  useEffect(() => {
    setGlobalToastContext(toastContext);
  }, [toastContext]);

  return children;
});

ToastContextSetter.displayName = 'ToastContextSetter';

// Static methods object
export const staticMethods: ToastStatic = {
  destroy: (id: string) => {
    if (!globalToastContext) {
      console.warn('Toast: ToastProvider not found. Please wrap your app with ToastProvider.');
      return;
    }
    globalToastContext.hide(id);
  },
  error: createStaticMethod('error'),
  info: createStaticMethod('info'),
  loading: createStaticMethod('loading'),
  success: createStaticMethod('success'),
};
