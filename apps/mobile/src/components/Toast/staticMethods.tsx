import { ReactNode, memo, useEffect } from 'react';

import { useToast } from './InnerToastProvider';
import type { ToastUpdateConfig } from './type';

// Global toast manager for static methods
let globalToastContext: ReturnType<typeof useToast> | null = null;

const setGlobalToastContext = (context: ReturnType<typeof useToast>) => {
  globalToastContext = context;
};

const MANUAL_DISMISS_DURATION = 300;

// Static methods interface
export interface ToastStatic {
  config: (id: string, config: ToastUpdateConfig) => boolean;
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
  config: (id: string, config: ToastUpdateConfig) => {
    if (!globalToastContext) {
      console.warn('Toast: ToastProvider not found. Please wrap your app with ToastProvider.');
      return false;
    }

    return globalToastContext.update(id, config);
  },
  destroy: (id: string) => {
    if (!globalToastContext) {
      console.warn('Toast: ToastProvider not found. Please wrap your app with ToastProvider.');
      return;
    }

    const updated = globalToastContext.update(id, { duration: MANUAL_DISMISS_DURATION });

    if (!updated) {
      globalToastContext.hide(id);
    }
  },
  error: createStaticMethod('error'),
  info: createStaticMethod('info'),
  loading: createStaticMethod('loading'),
  success: createStaticMethod('success'),
};
