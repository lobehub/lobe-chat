'use client';

import { LucideIcon } from 'lucide-react-native';
import { isValidElement, memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { useTheme } from '@/components/styles';

import { useIconContext } from './components/IconProvider';
import { calcSize } from './components/utils';
import type { IconProps } from './type';

const Icon = memo<IconProps>(
  ({
    icon,
    size: iconSize = 'middle',
    color,
    fill = 'transparent',
    focusable,
    spin,
    fillRule,
    fillOpacity,
    style,
    ...rest
  }) => {
    const theme = useTheme();
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

    const {
      color: colorConfig,
      fill: fillConfig,
      fillOpacity: fillOpacityConfig,
      fillRule: fillRuleConfig,
      focusable: focusableConfig,
      style: styleConfig,
      size: sizeConfig,
      ...restConfig
    } = useIconContext();

    const { size, strokeWidth } = useMemo(
      () => calcSize(iconSize || sizeConfig),
      [iconSize, sizeConfig],
    );

    const SvgIcon = icon as LucideIcon;

    const content =
      icon &&
      (isValidElement(icon) ? (
        icon
      ) : (
        <SvgIcon
          color={color || colorConfig || theme.colorText}
          fill={fill || fillConfig}
          fillOpacity={fillOpacity || fillOpacityConfig}
          fillRule={fillRule || fillRuleConfig}
          focusable={focusable || focusableConfig}
          height={size}
          size={size}
          strokeWidth={strokeWidth}
          width={size}
        />
      ));

    if (spin) {
      return (
        <Animated.View
          pointerEvents="none"
          style={[
            { flex: 0, height: size as number, width: size as number },
            style,
            styleConfig,
            { transform: [{ rotate: spinValue }] },
          ]}
          testID={spin ? 'icon-spin-wrapper' : undefined}
          {...restConfig}
          {...rest}
        >
          {content}
        </Animated.View>
      );
    }

    return (
      <View
        pointerEvents="none"
        style={[{ flex: 0, height: size as number, width: size as number }, style, styleConfig]}
        {...restConfig}
        {...rest}
      >
        {content}
      </View>
    );
  },
);

Icon.displayName = 'Icon';

export default Icon;
