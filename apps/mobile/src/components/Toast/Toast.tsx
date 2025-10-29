import {
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import ActionIcon from '@/components/ActionIcon';
import Block from '@/components/Block';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { useTheme } from '@/components/styles';

import { useStyles } from './style';
import type { ToastProps } from './type';

const Toast = memo<ToastProps>(
  ({ id, message, type, index, position = 'top', duration, onClose, showCloseButton }) => {
    const token = useTheme();
    const { styles } = useStyles();
    const prevIndexRef = useRef<number>(-1);
    const onCloseRef = useRef(onClose);

    // Update onClose ref when it changes
    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

    // Shared values for animations
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(position === 'top' ? -100 : 100);
    const scale = useSharedValue(0.9);

    // Calculate stack offset based on index
    const getStackOffset = useCallback(() => {
      const baseOffset = 8;
      const maxOffset = 16;
      const offset = Math.min(index * baseOffset, maxOffset);
      return position === 'top' ? offset : -offset;
    }, [index, position]);

    // Calculate scale based on stack position
    const getStackScale = useCallback(() => {
      const scaleReduction = 0.03;
      const minScale = 0.9;
      return Math.max(1 - index * scaleReduction, minScale);
    }, [index]);

    // Handle index changes (when other toasts are removed)
    useEffect(() => {
      if (prevIndexRef.current !== index && opacity.value > 0) {
        const soonerOffset = position === 'top' ? 2 : -2;

        translateY.value = withTiming(getStackOffset() + soonerOffset, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        scale.value = withTiming(getStackScale() * 0.98, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        setTimeout(() => {
          translateY.value = withSpring(getStackOffset(), {
            damping: 25,
            mass: 0.8,
            stiffness: 120,
            velocity: 0,
          });

          scale.value = withSpring(getStackScale(), {
            damping: 25,
            mass: 0.8,
            stiffness: 120,
            velocity: 0,
          });
        }, 200);
      }

      prevIndexRef.current = index;
    }, [index, position, getStackOffset, getStackScale]);

    // Initial entrance animation
    useEffect(() => {
      const delay = index * 50;

      setTimeout(() => {
        opacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        translateY.value = withSpring(getStackOffset(), {
          damping: 30,
          mass: 0.6,
          stiffness: 180,
          velocity: 0,
        });

        scale.value = withSpring(getStackScale(), {
          damping: 30,
          mass: 0.6,
          stiffness: 180,
          velocity: 0,
        });
      }, delay);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto dismiss animation
    useEffect(() => {
      if (!duration || duration <= 0) return;

      const exitDelay = Math.max(0, duration - 300);

      const timeoutId = setTimeout(() => {
        opacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        translateY.value = withTiming(position === 'top' ? -20 : 20, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        scale.value = withTiming(0.95, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        setTimeout(() => {
          if (onCloseRef.current) {
            runOnJS(onCloseRef.current)(id);
          }
        }, 300);
      }, exitDelay);

      return () => clearTimeout(timeoutId);
    }, [duration, position, id]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
        zIndex: 1000 - index,
      };
    });

    const handleDismiss = useCallback(() => {
      if (onCloseRef.current) {
        onCloseRef.current(id);
      }
    }, [id]);

    const handlePress = useCallback(() => {
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      translateY.value = withTiming(position === 'top' ? -100 : 100, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      scale.value = withTiming(0.8, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      setTimeout(() => {
        runOnJS(handleDismiss)();
      }, 200);
    }, [position, handleDismiss]);

    const getIcon = useCallback(() => {
      switch (type) {
        case 'success': {
          return <Icon color={token.colorSuccess} icon={CheckCircle} size="small" />;
        }
        case 'error': {
          return <Icon color={token.colorError} icon={XCircle} size="small" />;
        }
        case 'warning': {
          return <Icon color={token.colorWarning} icon={TriangleAlert} size="small" />;
        }
        case 'info': {
          return <Icon color={token.colorInfo} icon={Info} size="small" />;
        }
        case 'loading': {
          return <Icon color={token.colorInfo} icon={Loader2} size="small" spin />;
        }
        default: {
          return <Icon color={token.colorInfo} icon={AlertCircle} size="small" />;
        }
      }
    }, [type, token]);

    return (
      <View style={{ position: 'relative' }}>
        <Animated.View style={[styles.toastContainer, animatedStyle]} testID="toast-container">
          <Block
            align="center"
            gap={12}
            glass
            horizontal
            onPress={handlePress}
            padding={16}
            shadow
            style={styles.toast}
            testID="toast"
            variant={'outlined'}
          >
            {getIcon()}
            <Text style={styles.message}>{message}</Text>
            {showCloseButton && (
              <ActionIcon
                color={token.colorTextTertiary}
                icon={X}
                onPress={handlePress}
                size="small"
              />
            )}
          </Block>
        </Animated.View>
      </View>
    );
  },
);

Toast.displayName = 'Toast';

export default Toast;
