import { memo, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { cva } from '@/components/styles';

import Flexbox from '../Flexbox';
import { useStyles } from './style';
import type { BlockProps } from './type';

const Block = memo<BlockProps>(
  ({
    variant = 'filled',
    shadow,
    pressEffect,
    children,
    style,
    onPress,
    active,
    borderRadius,
    onLongPress,
    onPressOut,
    longPressEffect,
    ...rest
  }) => {
    const [isLongPressed, setIsLongPressed] = useState(false);
    const { styles, theme } = useStyles();

    const variants = useMemo(
      () =>
        cva(styles.root, {
          compoundVariants: [
            {
              active: true,
              style: styles.filledActive,
              variant: 'filled',
            },
            {
              active: true,
              style: styles.borderlessActive,
              variant: 'borderless',
            },
            {
              active: true,
              style: styles.outlinedActive,
              variant: 'outlined',
            },
            {
              pressEffect: true,
              pressed: true,
              style: Platform.select({
                ios: styles.filledHover,
              }),
              variant: 'filled',
            },
            {
              pressEffect: true,
              pressed: true,
              style: Platform.select({
                ios: styles.borderlessHover,
              }),
              variant: 'borderless',
            },
            {
              pressEffect: true,
              pressed: true,
              style: Platform.select({
                ios: styles.outlinedHover,
              }),
              variant: 'outlined',
            },
          ],
          defaultVariants: {
            variant: 'filled',
          },
          variants: {
            active: {
              false: null,
              true: null,
            },
            glass: {
              false: null,
              true: styles.glass,
            },
            hovered: {
              false: null,
              true: styles.filledHover,
            },
            pressEffect: {
              false: null,
              true: null,
            },
            pressed: {
              false: null,
              true: styles.filledActive,
            },
            shadow: {
              false: null,
              true: styles.shadow,
            },
            variant: {
              borderless: styles.borderless,
              filled: styles.filled,
              outlined: styles.outlined,
            },
          },
        }),
      [styles],
    );

    return (
      <Flexbox
        android_ripple={
          longPressEffect || pressEffect
            ? {
                color: theme.colorFillTertiary,
                foreground: longPressEffect ? isLongPressed : true,
              }
            : undefined
        }
        onLongPress={(e) => {
          onLongPress?.(e);
          if (longPressEffect) setIsLongPressed(true);
        }}
        onPress={onPress}
        onPressOut={(e) => {
          onPressOut?.(e);
          if (longPressEffect) setIsLongPressed(false);
        }}
        style={({ hovered, pressed }) => [
          variants({
            active,
            hovered,
            pressEffect: longPressEffect || pressEffect,
            pressed: longPressEffect ? isLongPressed : pressed,
            shadow,
            variant,
          }),
          {
            borderRadius:
              typeof borderRadius === 'number'
                ? borderRadius
                : borderRadius === false
                  ? 0
                  : theme.borderRadiusLG * 1.5,
          },
          typeof style === 'function' ? style({ hovered, pressed }) : style,
        ]}
        {...rest}
      >
        {children}
      </Flexbox>
    );
  },
);

Block.displayName = 'Block';

export default Block;
