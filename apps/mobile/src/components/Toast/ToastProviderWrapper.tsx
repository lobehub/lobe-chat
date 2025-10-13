import type { FC } from 'react';
import { ReactNode } from 'react';

import { ToastProvider as OriginalToastProvider } from './ToastProvider';
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

export { staticMethods } from './staticMethods';
