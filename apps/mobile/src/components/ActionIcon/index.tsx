import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, ColorValue, Easing, Pressable, PressableProps, ViewStyle } from 'react-native';
import { LoaderCircle } from 'lucide-react-native';

import { useThemeToken } from '@/theme';
import { ActionIconSize, calcSize, getBaseStyle, getVariantStyle } from './style';

type IconComponent = React.ComponentType<{ color?: ColorValue; size?: number }>;

const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
const REACT_MEMO_TYPE = Symbol.for('react.memo');

export interface ActionIconProps extends Omit<PressableProps, 'children'> {
  disabled?: boolean;
  icon?: IconComponent | React.ReactNode;
  loading?: boolean;
  size?: ActionIconSize;
  variant?: 'borderless' | 'filled' | 'outlined';
}

const isIconComponent = (icon?: ActionIconProps['icon']): icon is IconComponent => {
  if (!icon) {
    return false;
  }

  if (typeof icon === 'function') {
    return true;
  }

  if (typeof icon === 'object' && icon !== null && '$$typeof' in icon) {
    const $$typeof = (icon as { $$typeof: symbol }).$$typeof;
    return $$typeof === REACT_FORWARD_REF_TYPE || $$typeof === REACT_MEMO_TYPE;
  }

  return false;
};

const ActionIcon: React.FC<ActionIconProps> = memo(
  ({ icon, loading, disabled, size = 'middle', variant = 'borderless', style, ...rest }) => {
    const token = useThemeToken();
    const { blockSize, borderRadius, innerIconSize } = useMemo(() => calcSize(size), [size]);

    const baseStyle: ViewStyle = getBaseStyle(blockSize, borderRadius, disabled);

    const variantStyle: ViewStyle = useMemo(
      () => getVariantStyle(variant, token),
      [variant, token],
    );

    const iconColor: ColorValue = token.colorTextTertiary;

    const rotationProgress = useRef(new Animated.Value(0)).current;
    const rotationAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
    const spin = rotationProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
      if (loading) {
        rotationProgress.setValue(0);
        rotationAnimationRef.current = Animated.loop(
          Animated.timing(rotationProgress, {
            duration: 1000,
            easing: Easing.linear,
            toValue: 1,
            useNativeDriver: true,
          }),
        );
        rotationAnimationRef.current.start();
      } else {
        rotationAnimationRef.current?.stop?.();
      }

      return () => {
        rotationAnimationRef.current?.stop?.();
      };
    }, [loading, rotationProgress]);

    const renderIcon = () => {
      if (!icon) {
        return null;
      }

      if (isIconComponent(icon)) {
        return React.createElement(icon, { color: iconColor, size: innerIconSize });
      }

      if (React.isValidElement(icon)) {
        return icon;
      }

      return icon as React.ReactNode;
    };

    const loaderColor = typeof iconColor === 'string' ? iconColor : undefined;
    const loaderSize = innerIconSize ?? 20;

    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        style={(state) => [
          baseStyle,
          variantStyle,
          state.pressed && !disabled ? { opacity: 0.7 } : null,
          typeof style === 'function' ? style(state) : style,
        ]}
        {...rest}
      >
        {loading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }} testID="action-icon-loader">
            <LoaderCircle color={loaderColor} size={loaderSize} />
          </Animated.View>
        ) : (
          renderIcon()
        )}
      </Pressable>
    );
  },
);

ActionIcon.displayName = 'ActionIcon';

export default ActionIcon;
