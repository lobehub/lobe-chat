import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import { Animated, DimensionValue } from 'react-native';

import Flexbox, { FlexboxProps } from '@/components/Flexbox';

import { useStyles } from './style';
import { useSkeletonAnimation } from './useSkeletonAnimation';

interface SkeletonParagraphProps extends Omit<FlexboxProps, 'width'> {
  animated?: boolean;
  backgroundColor?: string;
  fontSize?: number;
  highlightColor?: string;
  rows?: number;

  width?: DimensionValue | DimensionValue[];
}

const SkeletonParagraph = memo<SkeletonParagraphProps>(
  ({ rows = 3, width, animated = false, style, fontSize = 14 }) => {
    const { styles } = useStyles();
    const opacityInterpolation = useSkeletonAnimation(animated);

    // Memoize lines generation
    const lines = useMemo(() => {
      const result = [] as ReactNode[];
      for (let i = 0; i < rows; i++) {
        let lineWidth: DimensionValue = '100%';

        if (Array.isArray(width)) {
          lineWidth = width[i] || '100%';
        } else if (width) {
          lineWidth = width;
        } else if (i === rows - 1) {
          lineWidth = '60%';
        }

        result.push(
          <Animated.View
            key={i}
            style={[
              styles.skeletonItem,
              {
                height: fontSize,
              },
              { width: lineWidth },
              i === rows - 1 && { marginBottom: 0 },
              opacityInterpolation && { opacity: opacityInterpolation },
            ]}
          />,
        );
      }
      return result;
    }, [rows, width, styles.skeletonItem, fontSize, opacityInterpolation]);

    return (
      <Flexbox gap={fontSize * 0.5} style={style} testID="skeleton-paragraph">
        {lines}
      </Flexbox>
    );
  },
);

SkeletonParagraph.displayName = 'SkeletonParagraph';

export default SkeletonParagraph;
