import { CheckCircle, Info, RefreshCw, X, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';

import { ICON_SIZE_SMALL } from '@/const/common';
import { useThemeToken } from '@/theme';
import { useStyles } from './style';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastProps {
  duration?: number;
  id: string;
  message: string;
  onClose?: (id: string) => void;
  opacity: Animated.Value;
  type: ToastType;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, opacity, onClose }) => {
  const token = useThemeToken();
  const { styles } = useStyles();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'loading') {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          duration: 1000,
          toValue: 1,
          useNativeDriver: true,
        }),
      );
      spin.start();
      return () => spin.stop();
    }
  }, [type, spinValue]);

  const getIcon = () => {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    switch (type) {
      case 'success': {
        return <CheckCircle color={token.colorSuccess} size={ICON_SIZE_SMALL} />;
      }
      case 'error': {
        return <XCircle color={token.colorError} size={ICON_SIZE_SMALL} />;
      }
      case 'info': {
        return <Info color={token.colorInfo} size={ICON_SIZE_SMALL} />;
      }
      case 'loading': {
        return (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCw color={token.colorInfo} size={ICON_SIZE_SMALL} />
          </Animated.View>
        );
      }
      default: {
        return null;
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose(id);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handleClose} style={styles.touchable}>
      <Animated.View style={[styles.toast, { opacity }]}>
        {getIcon()}
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
          onPress={handleClose}
          style={styles.closeButton}
        >
          <X color={token.colorTextTertiary} size={16} />
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Toast;
