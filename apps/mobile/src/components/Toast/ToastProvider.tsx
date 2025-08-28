import React, { ReactNode } from 'react';

import { ToastContextSetter } from './staticMethods';
import { ToastProvider as OriginalToastProvider } from './InnerToastProvider';

// Enhanced ToastProvider that sets global context
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <OriginalToastProvider>
      <ToastContextSetter>{children}</ToastContextSetter>
    </OriginalToastProvider>
  );
};

export { useToast } from './InnerToastProvider';
export { staticMethods } from './staticMethods';
