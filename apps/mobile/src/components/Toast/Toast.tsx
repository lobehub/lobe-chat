import { CheckCircle, Info, RefreshCw, X, XCircle } from 'lucide-react-native';
import React from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';

import Icon from '@/components/Icon';
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

  const getIcon = () => {
    switch (type) {
      case 'success': {
        return <Icon color={token.colorSuccess} icon={CheckCircle} size="small" />;
      }
      case 'error': {
        return <Icon color={token.colorError} icon={XCircle} size="small" />;
      }
      case 'info': {
        return <Icon color={token.colorInfo} icon={Info} size="small" />;
      }
      case 'loading': {
        return <Icon color={token.colorInfo} icon={RefreshCw} size="small" spin />;
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
          <Icon color={token.colorTextTertiary} icon={X} />
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Toast;
