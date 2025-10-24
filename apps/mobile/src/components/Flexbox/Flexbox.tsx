import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { memo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { useThemeMode } from '@/components';

import type { FlexboxProps } from './type';

const Flexbox = memo<FlexboxProps>(
  ({
    horizontal,
    justify = 'flex-start',
    align = 'stretch',
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

    if (glass && isLiquidGlassSupported) {
      if (onPress || onLongPress) {
        return (
          <Pressable
            delayLongPress={onLongPress ? 500 : undefined}
            onLongPress={onLongPress}
            onPress={onPress}
            unstable_pressDelay={0}
            {...rest}
          >
            <LiquidGlassView
              colorScheme={isDarkMode ? 'dark' : 'light'}
              effect={'regular'}
              interactive
              style={[
                styles,
                typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
                {
                  backgroundColor: 'transparent',
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
            {
              pointerEvents: 'box-none',
            },
            styles,
            typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
            {
              backgroundColor: 'transparent',
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
          {
            pointerEvents: 'box-none',
          },
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
