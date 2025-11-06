import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { useThemeMode } from '@/components';
import { isIOS } from '@/utils/detection';

import type { FlexboxProps } from './type';

const Flexbox = memo<FlexboxProps>(
  ({
    horizontal,
    justify = 'flex-start',
    align = 'stretch',
    wrap = 'nowrap',
    blur,
    blurColor,
    flex,
    children,
    width,
    height,
    gap,
    style,
    padding,
    paddingBlock,
    paddingInline,
    onPress,
    onLongPress,
    pressableStyle,
    glass,
    glassColor = 'transparent',
    pressEffect,
    ...rest
  }) => {
    const { isDarkMode } = useThemeMode();
    const styles: StyleProp<ViewStyle> = {
      alignItems: align,
      display: 'flex',
      flex: flex,
      flexDirection: horizontal ? 'row' : 'column',
      flexWrap: wrap,
      gap: gap,
      height: height,
      justifyContent: justify,
      padding: padding,
      paddingBlock: paddingBlock,
      paddingInline: paddingInline,
      position: 'relative',
      width: width,
    };

    if (blur && isIOS) {
      if (onPress || onLongPress) {
        return (
          <Pressable
            delayLongPress={onLongPress ? 500 : undefined}
            onLongPress={onLongPress}
            onPress={onPress}
            style={pressableStyle}
            unstable_pressDelay={0}
            {...rest}
          >
            <BlurView
              intensity={33}
              style={[
                styles,
                typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
                {
                  backgroundColor:
                    blurColor || (isDarkMode ? 'transparent' : 'rgba(255, 255, 255, 0.75)'),
                },
              ]}
              tint={isDarkMode ? 'dark' : 'extraLight'}
            >
              {children}
            </BlurView>
          </Pressable>
        );
      }

      return (
        <BlurView
          intensity={33}
          style={[
            styles,
            typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
            {
              backgroundColor:
                blurColor || (isDarkMode ? 'transparent' : 'rgba(255, 255, 255, 0.75)'),
            },
          ]}
          tint={isDarkMode ? 'dark' : 'extraLight'}
          {...rest}
        >
          {children}
        </BlurView>
      );
    }

    if (glass && isLiquidGlassSupported) {
      if (onPress || onLongPress) {
        return (
          <Pressable
            delayLongPress={onLongPress ? 500 : undefined}
            onLongPress={onLongPress}
            onPress={onPress}
            style={pressableStyle}
            unstable_pressDelay={0}
            {...rest}
          >
            <LiquidGlassView
              colorScheme={isDarkMode ? 'dark' : 'light'}
              effect={'regular'}
              interactive={pressEffect}
              style={[
                styles,
                typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
                {
                  backgroundColor: glassColor,
                  borderWidth: 0,
                },
              ]}
            >
              {children}
            </LiquidGlassView>
          </Pressable>
        );
      }

      return (
        <LiquidGlassView
          colorScheme={isDarkMode ? 'dark' : 'light'}
          effect={'regular'}
          interactive={false}
          style={[
            styles,
            typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
            {
              backgroundColor: glassColor,
              borderWidth: 0,
            },
          ]}
          {...rest}
        >
          {children}
        </LiquidGlassView>
      );
    }

    if (onPress || onLongPress) {
      return (
        <Pressable
          delayLongPress={onLongPress ? 500 : undefined}
          onLongPress={onLongPress}
          onPress={onPress}
          style={(state) => [styles, typeof style === 'function' ? style(state) : style]}
          unstable_pressDelay={0}
          {...rest}
        >
          {children}
        </Pressable>
      );
    }

    return (
      <View
        style={[
          styles,
          typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  },
);

Flexbox.displayName = 'Flexbox';

export default Flexbox;
