import { CheckCircle, Info, RefreshCw, X, XCircle } from 'lucide-react-native';
import { memo } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { useTheme } from '@/components/styles';

import { useStyles } from './style';
import type { ToastProps } from './type';

const Toast = memo<ToastProps>(({ id, message, type, opacity, onClose }) => {
  const token = useTheme();
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
      <Animated.View style={[styles.toast, { opacity }]} testID="toast">
        {getIcon()}
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
          onPress={handleClose}
          style={styles.closeButton}
          testID="toast-close-button"
        >
          <Icon color={token.colorTextTertiary} icon={X} />
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
});

Toast.displayName = 'Toast';

export default Toast;
