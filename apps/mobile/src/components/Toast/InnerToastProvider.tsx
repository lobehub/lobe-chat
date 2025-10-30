import { ReactNode, createContext, memo, useCallback, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import Toast from './Toast';
import { useStyles } from './style';
import type { ToastItemInternal, ToastPosition, ToastType } from './type';

interface ToastConfig {
  duration?: number;
  message: string;
  onClose?: () => void;
  position?: ToastPosition;
  type: ToastType;
}

interface ToastContextType {
  error: (message: string, duration?: number, onClose?: () => void) => void;
  hide: (id: string) => void;
  info: (message: string, duration?: number, onClose?: () => void) => void;
  loading: (message: string, duration?: number, onClose?: () => void) => void;
  show: (config: ToastConfig) => void;
  success: (message: string, duration?: number, onClose?: () => void) => void;
  warning: (message: string, duration?: number, onClose?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = 3000;

export const ToastProvider = memo<ToastProviderProps>(({ children }) => {
  const [toasts, setToasts] = useState<ToastItemInternal[]>([]);
  const { styles } = useStyles();

  const hide = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onClose) {
        try {
          toast.onClose();
        } catch (error) {
          console.error('Toast onClose error:', error);
        }
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const show = useCallback((config: ToastConfig) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const duration = config.duration ?? DEFAULT_DURATION;
    const position = config.position ?? 'top';

    const newToast: ToastItemInternal = {
      duration,
      id,
      message: config.message,
      onClose: config.onClose,
      position,
      type: config.type,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const success = useCallback(
    (message: string, duration?: number, onClose?: () => void) => {
      show({ duration, message, onClose, type: 'success' });
    },
    [show],
  );

  const error = useCallback(
    (message: string, duration?: number, onClose?: () => void) => {
      show({ duration, message, onClose, type: 'error' });
    },
    [show],
  );

  const warning = useCallback(
    (message: string, duration?: number, onClose?: () => void) => {
      show({ duration, message, onClose, type: 'warning' });
    },
    [show],
  );

  const info = useCallback(
    (message: string, duration?: number, onClose?: () => void) => {
      show({ duration, message, onClose, type: 'info' });
    },
    [show],
  );

  const loading = useCallback(
    (message: string, duration?: number, onClose?: () => void) => {
      show({ duration, message, onClose, type: 'loading' });
    },
    [show],
  );

  const contextValue: ToastContextType = {
    error,
    hide,
    info,
    loading,
    show,
    success,
    warning,
  };

  // Separate toasts by position
  const topToasts = toasts.filter((toast) => toast.position === 'top');
  const bottomToasts = toasts.filter((toast) => toast.position === 'bottom');

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Top Viewport */}
      <SafeAreaView
        edges={['top']}
        pointerEvents="box-none"
        style={[styles.viewport, styles.topViewport]}
      >
        {topToasts.map((toast, arrayIndex) => {
          const displayIndex = topToasts.length - 1 - arrayIndex;
          return (
            <Toast
              duration={toast.duration}
              id={toast.id}
              index={displayIndex}
              key={toast.id}
              message={toast.message}
              onClose={hide}
              position="top"
              type={toast.type}
            />
          );
        })}
      </SafeAreaView>

      {/* Bottom Viewport */}
      <SafeAreaView
        edges={['bottom']}
        pointerEvents="box-none"
        style={[styles.viewport, styles.bottomViewport]}
      >
        {bottomToasts.map((toast, arrayIndex) => {
          const displayIndex = bottomToasts.length - 1 - arrayIndex;
          return (
            <Toast
              duration={toast.duration}
              id={toast.id}
              index={displayIndex}
              key={toast.id}
              message={toast.message}
              onClose={hide}
              position="bottom"
              type={toast.type}
            />
          );
        })}
      </SafeAreaView>
    </ToastContext.Provider>
  );
});

ToastProvider.displayName = 'ToastProvider';

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
