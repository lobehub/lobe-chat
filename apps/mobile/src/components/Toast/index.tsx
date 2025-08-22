import React, { ReactNode, useEffect } from 'react';

import ToastComponent from './Toast';
import { ToastProvider as OriginalToastProvider, useToast } from './ToastProvider';

// Global toast manager for static methods
let globalToastContext: ReturnType<typeof useToast> | null = null;

const setGlobalToastContext = (context: ReturnType<typeof useToast>) => {
  globalToastContext = context;
};

// Static methods interface
interface ToastStatic {
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  loading: (message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
}

const createStaticMethod = (type: 'success' | 'error' | 'info' | 'loading') => {
  return (message: string, duration?: number) => {
    if (!globalToastContext) {
      console.warn('Toast: ToastProvider not found. Please wrap your app with ToastProvider.');
      return;
    }

    globalToastContext[type](message, duration);
  };
};

// Component to set global context
const ToastContextSetter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastContext = useToast();

  useEffect(() => {
    setGlobalToastContext(toastContext);
  }, [toastContext]);

  return children;
};

// Enhanced ToastProvider that sets global context
interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <OriginalToastProvider>
      <ToastContextSetter>{children}</ToastContextSetter>
    </OriginalToastProvider>
  );
};

// Create the Toast object with static methods
const Toast = ToastComponent as typeof ToastComponent & ToastStatic;

Toast.success = createStaticMethod('success');
Toast.error = createStaticMethod('error');
Toast.info = createStaticMethod('info');
Toast.loading = createStaticMethod('loading');

export default Toast;
export { ToastProvider };
export { useToast } from './ToastProvider';
