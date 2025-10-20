import { memo } from 'react';
import { Animated, DimensionValue, ViewStyle } from 'react-native';

import { useStyles } from './style';
import { useSkeletonAnimation } from './useSkeletonAnimation';

interface SkeletonTitleProps {
  animated?: boolean;
  backgroundColor?: string;
  fontSize?: number;
  highlightColor?: string;
  style?: ViewStyle;
  width?: DimensionValue;
}

const SkeletonTitle = memo<SkeletonTitleProps>(
  ({ width = '60%', animated = false, style, fontSize = 16 }) => {
    const { styles } = useStyles();
    const opacityInterpolation = useSkeletonAnimation(animated);

    return (
      <Animated.View
        style={[
          styles.skeletonItem,
          {
            height: fontSize,
          },
          { width },
          opacityInterpolation && { opacity: opacityInterpolation },
          style,
        ]}
        testID="skeleton-title"
      />
    );
  },
);

SkeletonTitle.displayName = 'SkeletonTitle';

export default SkeletonTitle;
