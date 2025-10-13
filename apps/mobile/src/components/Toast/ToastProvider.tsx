import type { FC } from 'react';
import { ReactNode } from 'react';

import { ToastProvider as OriginalToastProvider } from './InnerToastProvider';
import { ToastContextSetter } from './staticMethods';

// Enhanced ToastProvider that sets global context
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  return (
    <OriginalToastProvider>
      <ToastContextSetter>{children}</ToastContextSetter>
    </OriginalToastProvider>
  );
};

export { useToast } from './InnerToastProvider';
export { staticMethods } from './staticMethods';
