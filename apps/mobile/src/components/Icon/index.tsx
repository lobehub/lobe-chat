import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { ICON_SIZE, ICON_SIZE_LARGE, ICON_SIZE_SMALL } from '@/_const/common';
import { useTheme } from '@/theme';

import type {
  IconComponentType,
  IconProps,
  IconRenderable,
  IconSize,
  IconSizeConfig,
} from './type';

const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
const REACT_MEMO_TYPE = Symbol.for('react.memo');

const isIconComponent = (icon: IconRenderable): icon is IconComponentType => {
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

const resolveIconSize = (size?: IconSize): number => {
  if (typeof size === 'number') {
    return size;
  }

  if (typeof size === 'object' && size !== null) {
    const config = size as IconSizeConfig;
    return typeof config.size === 'number' ? config.size : ICON_SIZE;
  }

  if (size === 'large') {
    return ICON_SIZE_LARGE;
  }

  if (size === 'small') {
    return ICON_SIZE_SMALL;
  }

  return ICON_SIZE;
};

const Icon: React.FC<IconProps> = memo(({ icon, size = 'middle', color, spin = false, style }) => {
  const token = useTheme();
  const resolvedSize = resolveIconSize(size);
  const resolvedColor = color ?? token.colorText;
  const rotationProgress = useRef(new Animated.Value(0)).current;
  const rotationAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const spinValue = rotationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (spin) {
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
      rotationAnimationRef.current?.stop();
      rotationProgress.setValue(0);
    }

    return () => {
      rotationAnimationRef.current?.stop();
    };
  }, [spin, rotationProgress]);

  const renderIcon = () => {
    if (!icon) {
      return null;
    }

    if (isIconComponent(icon)) {
      return React.createElement(icon, { color: resolvedColor, size: resolvedSize });
    }

    if (React.isValidElement(icon)) {
      const nextProps: Record<string, unknown> = {};
      const element = icon as React.ReactElement<any>;

      if (color !== undefined || element.props?.color === undefined) {
        nextProps.color = resolvedColor;
      }

      if (size !== undefined) {
        nextProps.size = resolvedSize;
      }

      return Object.keys(nextProps).length > 0 ? React.cloneElement(element, nextProps) : icon;
    }

    return icon as React.ReactNode;
  };

  const content = renderIcon();

  if (!content) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, spin ? { transform: [{ rotate: spinValue }] } : null]}
      testID={spin ? 'icon-spin-wrapper' : undefined}
    >
      {content}
    </Animated.View>
  );
});

Icon.displayName = 'Icon';

export default Icon;
export type {
  IconComponentType,
  IconProps,
  IconRenderable,
  IconSize,
  IconSizeConfig,
} from './type';
