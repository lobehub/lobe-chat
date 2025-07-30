import React, { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Toast, { ToastProps, ToastType } from './Toast';

interface ToastConfig {
  duration?: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  error: (message: string, duration?: number) => void;
  hide: (id: string) => void;
  info: (message: string, duration?: number) => void;
  loading: (message: string, duration?: number) => void;
  show: (config: ToastConfig) => void;
  success: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastItem extends Omit<ToastProps, 'opacity'> {
  opacity: Animated.Value;
  timeoutId?: ReturnType<typeof setTimeout>;
  translateY: Animated.Value;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hide = useCallback(
    (id: string) => {
      setToasts((prev) => {
        const toast = prev.find((t) => t.id === id);
        if (toast) {
          // 清理定时器
          if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
          }

          // 执行退出动画
          Animated.parallel([
            Animated.timing(toast.opacity, {
              duration: 100,
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.timing(toast.translateY, {
              duration: 100,
              toValue: -10,
              useNativeDriver: true,
            }),
          ]).start(() => {
            removeToast(id);
          });
        }
        return prev;
      });
    },
    [removeToast],
  );

  const show = useCallback(
    (config: ToastConfig) => {
      const id = Date.now().toString();
      const opacity = new Animated.Value(0);
      const translateY = new Animated.Value(-10); // 从当前位置向上10px开始
      const duration = config.duration ?? 2000;

      const newToast: ToastItem = {
        duration,
        id,
        message: config.message,
        opacity,
        translateY,
        type: config.type,
      };

      // 添加新的 toast
      setToasts((prev) => [...prev, newToast]);

      // 滑入动画（轻微向下移动 + 透明度）
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 150,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          duration: 150,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();

      // 自动移除
      const timeoutId = setTimeout(() => {
        hide(id);
      }, duration);

      newToast.timeoutId = timeoutId;
    },
    [hide],
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      show({ duration, message, type: 'success' });
    },
    [show],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      show({ duration, message, type: 'error' });
    },
    [show],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      show({ duration, message, type: 'info' });
    },
    [show],
  );

  const loading = useCallback(
    (message: string, duration?: number) => {
      show({ duration, message, type: 'loading' });
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
  };

  const styles = StyleSheet.create({
    toastContainer: {
      left: 0,
      paddingHorizontal: 16,
      position: 'absolute',
      right: 0,
      zIndex: 9999,
    },
  });

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map((toast) => (
        <Animated.View
          key={toast.id}
          style={[
            styles.toastContainer,
            {
              pointerEvents: 'auto',
              top: insets.top + 44 + 8,
              transform: [{ translateY: toast.translateY }],
            },
          ]}
        >
          <Toast
            duration={toast.duration}
            id={toast.id}
            message={toast.message}
            onClose={hide}
            opacity={toast.opacity}
            type={toast.type}
          />
        </Animated.View>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
