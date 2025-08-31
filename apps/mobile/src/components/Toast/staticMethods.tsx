import React, { ReactNode, useEffect } from 'react';

import { useToast } from './InnerToastProvider';

// Global toast manager for static methods
let globalToastContext: ReturnType<typeof useToast> | null = null;

const setGlobalToastContext = (context: ReturnType<typeof useToast>) => {
  globalToastContext = context;
};

// Static methods interface
export interface ToastStatic {
  error: (message: string, duration?: number, onClose?: () => void) => void;
  info: (message: string, duration?: number, onClose?: () => void) => void;
  loading: (message: string, duration?: number, onClose?: () => void) => void;
  success: (message: string, duration?: number, onClose?: () => void) => void;
}

const createStaticMethod = (type: 'success' | 'error' | 'info' | 'loading') => {
  return (message: string, duration?: number, onClose?: () => void) => {
    if (!globalToastContext) {
      console.warn('Toast: ToastProvider not found. Please wrap your app with ToastProvider.');
      return;
    }

    globalToastContext[type](message, duration, onClose);
  };
};

// Component to set global context
export const ToastContextSetter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastContext = useToast();

  useEffect(() => {
    setGlobalToastContext(toastContext);
  }, [toastContext]);

  return children;
};

// Static methods object
export const staticMethods: ToastStatic = {
  error: createStaticMethod('error'),
  info: createStaticMethod('info'),
  loading: createStaticMethod('loading'),
  success: createStaticMethod('success'),
};
