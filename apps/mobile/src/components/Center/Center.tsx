import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { memo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

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
    ...rest
  }) => {
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

    if (glass && isLiquidGlassSupported) {
      if (onPress || onLongPress) {
        return (
          <Pressable onLongPress={onLongPress} onPress={onPress} {...rest}>
            <LiquidGlassView
              effect={'regular'}
              interactive
              style={[
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
