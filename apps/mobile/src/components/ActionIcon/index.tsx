import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ColorValue,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { useThemeToken } from '@/theme';

interface ActionIconProps extends PressableProps {
  /**
   * The color of the icon. Defaults to the current text color.
   */
  color?: ColorValue;
  /**
   * The duration of the spin animation in milliseconds. Defaults to 1000.
   */
  duration?: number;
  /**
   * The icon to display. Can be a string, React element, or other.
   */
  icon: React.FC<{ color?: ColorValue; size?: number | string; style?: StyleProp<ViewStyle> }>;
  /**
   * The size of the icon. Defaults to 24.
   */
  size?: number;
  /**
   * Whether the icon should spin or not. Defaults to false.
   */
  spin?: boolean;
  /**
   * The variant of the icon. Defaults to 'default'.
   */
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
}

const ActionIcon: React.FC<ActionIconProps> = ({
  icon: Icon,
  size = 24,
  color,
  spin = false,
  duration = 1000,
  variant = 'default',
  style,
  ...rest
}) => {
  const token = useThemeToken();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const getIconColor = (): ColorValue => {
    if (color) {
      return color;
    }

    switch (variant) {
      case 'primary': {
        return token.colorPrimary;
      }
      case 'secondary': {
        return token.colorTextSecondary;
      }
      case 'danger': {
        return token.colorError;
      }
      default: {
        return token.colorText;
      }
    }
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      borderRadius: token.borderRadiusXS,
      justifyContent: 'center',
      padding: token.paddingXS,
    };

    switch (variant) {
      case 'primary': {
        return {
          ...baseStyle,
          backgroundColor: token.colorPrimaryBg,
        };
      }
      case 'secondary': {
        return {
          ...baseStyle,
          backgroundColor: token.colorFillSecondary,
        };
      }
      case 'danger': {
        return {
          ...baseStyle,
          backgroundColor: token.colorErrorBg,
        };
      }
      default: {
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      }
    }
  };

  useEffect(() => {
    if (spin) {
      rotateAnim.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          duration,
          easing: Easing.linear,
          isInteraction: false,
          toValue: 1,
          useNativeDriver: true,
        }),
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      rotateAnim.setValue(0);
    }
    return () => {
      loopRef.current?.stop();
    };
  }, [spin, rotateAnim, duration]);

  const spinTransform = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = spin
    ? {
        transform: [{ rotate: spinTransform }],
      }
    : {};

  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        getContainerStyle(),
        state.pressed && { opacity: 0.7 },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Animated.View style={animatedStyle}>
        <Icon color={getIconColor()} size={size} />
      </Animated.View>
    </Pressable>
  );
};

export default ActionIcon;
