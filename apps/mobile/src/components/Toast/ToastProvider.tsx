import { ReactNode, memo } from 'react';

import { ToastProvider as OriginalToastProvider } from './InnerToastProvider';
import { ToastContextSetter } from './staticMethods';

// Enhanced ToastProvider that sets global context
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = memo<ToastProviderProps>(({ children }) => {
  return (
    <OriginalToastProvider>
      <ToastContextSetter>{children}</ToastContextSetter>
    </OriginalToastProvider>
  );
});

ToastProvider.displayName = 'ToastProvider';

export { useToast } from './InnerToastProvider';
export { staticMethods } from './staticMethods';
