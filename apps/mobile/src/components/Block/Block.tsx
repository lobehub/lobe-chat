import React, { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';

import { cva } from '@/theme';

import Flexbox from '../Flexbox';
import { useStyles } from './style';
import type { BlockProps } from './type';

const Block = memo<BlockProps>(
  ({ variant = 'filled', shadow, glass, clickable, children, style, onPress, ...rest }) => {
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

    if (clickable && onPress) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={cx(variants({ clickable, glass, shadow, variant }), style)}
        >
          <Flexbox {...rest}>{children}</Flexbox>
        </TouchableOpacity>
      );
    }

    // 否则使用普通的 View
    return (
      <Flexbox style={cx(variants({ clickable, glass, shadow, variant }), style)} {...rest}>
        {children}
      </Flexbox>
    );
  },
);

Block.displayName = 'Block';

export default Block;
