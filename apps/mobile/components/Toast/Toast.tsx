import { CheckCircle, Info, RefreshCw, X, XCircle } from 'lucide-react-native';
import React from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';

import { ICON_SIZE_SMALL } from '@/mobile/const/common';
import { useThemeToken } from '@/mobile/theme';
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

  const getIcon = () => {
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
        return <RefreshCw color={token.colorInfo} size={ICON_SIZE_SMALL} />;
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
