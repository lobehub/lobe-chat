import { memo, useMemo } from 'react';

import { cva } from '@/components/styles';

import Flexbox from '../Flexbox';
import { useStyles } from './style';
import type { BlockProps } from './type';

const Block = memo<BlockProps>(
  ({ variant = 'filled', shadow, clickable, children, style, onPress, ...rest }) => {
    const { styles } = useStyles();

    const variants = useMemo(
      () =>
        cva(styles.root, {
          compoundVariants: [
            {
              clickable: true,
              pressed: true,
              style: styles.filledHover,
              variant: 'filled',
            },
            {
              clickable: true,
              pressed: true,
              style: styles.borderlessHover,
              variant: 'borderless',
            },
            {
              clickable: true,
              pressed: true,
              style: styles.outlinedActive,
              variant: 'outlined',
            },
          ],
          defaultVariants: {
            variant: 'filled',
          },
          variants: {
            clickable: {
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
        onPress={onPress}
        style={({ hovered, pressed }) => [
          variants({ clickable, hovered, pressed, shadow, variant }),
          style,
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
