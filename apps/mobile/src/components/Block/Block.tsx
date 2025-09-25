import React, { memo, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { cva } from '@/theme';

import FlexBox from '../FlexBox';
import { useStyles } from './style';
import type { BlockProps } from './type';

const Block = memo<BlockProps>(
  ({
    variant = 'filled',
    shadow = false,
    glass = false,
    clickable = false,
    children,
    style,
    onPress,
    ...rest
  }) => {
    const { cx, styles } = useStyles();

    const variants = useMemo(
      () =>
        cva(styles.root, {
          compoundVariants: [
            {
              clickable: true,
              style: styles.clickableBorderless,
              variant: 'borderless',
            },
            {
              clickable: true,
              style: styles.clickableFilled,
              variant: 'filled',
            },
            {
              clickable: true,
              style: styles.clickableOutlined,
              variant: 'outlined',
            },
          ],
          defaultVariants: {
            clickable: false,
            glass: false,
            shadow: false,
            variant: 'filled',
          },
          variants: {
            clickable: {
              false: null,
              true: styles.clickableRoot,
            },
            glass: {
              false: null,
              true: styles.glass,
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

    // 如果是可点击的，使用 TouchableOpacity
    if (clickable && onPress) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={cx(variants({ clickable, glass, shadow, variant }), style)}
        >
          <FlexBox {...rest}>{children}</FlexBox>
        </TouchableOpacity>
      );
    }

    // 否则使用普通的 View
    return (
      <View style={cx(variants({ clickable, glass, shadow, variant }), style)}>
        <FlexBox {...rest}>{children}</FlexBox>
      </View>
    );
  },
);

Block.displayName = 'Block';

export default Block;
