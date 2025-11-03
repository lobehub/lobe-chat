import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { useThemeMode } from '@/components';
import { isIOS } from '@/utils/detection';

import type { CenterProps } from './type';

const Center = memo<CenterProps>(
  ({
    horizontal,
    justify = 'center',
    align = 'center',
    wrap = 'nowrap',
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
    glass,
    glassColor = 'transparent',
    blur,
    blurColor,
    pressableStyle,
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
                    blurColor || isDarkMode ? 'transparent' : 'rgba(255, 255, 255, 0.75)',
                  borderWidth: 0,
                },
              ]}
              tint={isDarkMode ? 'dark' : 'light'}
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
                blurColor || isDarkMode ? 'transparent' : 'rgba(255, 255, 255, 0.75)',
              borderWidth: 0,
            },
          ]}
          tint={isDarkMode ? 'dark' : 'light'}
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
            onLongPress={onLongPress}
            onPress={onPress}
            style={{
              flex: 1,
            }}
            {...rest}
          >
            <LiquidGlassView
              effect={'regular'}
              interactive
              style={[
                styles,
                typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
                {
                  backgroundColor: glassColor,
                },
              ]}
              {...rest}
            >
              {children}
            </LiquidGlassView>
          </Pressable>
        );
      }

      return (
        <LiquidGlassView
          effect={'regular'}
          interactive={false}
          style={[
            styles,
            typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
            {
              backgroundColor: glassColor,
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
          onLongPress={onLongPress}
          onPress={onPress}
          style={(state) => [styles, typeof style === 'function' ? style(state) : style]}
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

Center.displayName = 'Center';

export default Center;
