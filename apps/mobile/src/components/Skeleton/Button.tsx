import { memo, useMemo } from 'react';
import { Animated, DimensionValue, ViewStyle } from 'react-native';

import { useTheme } from '@/components/styles';

import { useStyles } from './style';
import { useSkeletonAnimation } from './useSkeletonAnimation';

type SkeletonButtonSize = 'small' | 'middle' | 'large';
type SkeletonButtonShape = 'default' | 'circle';

interface SkeletonButtonProps {
  animated?: boolean;
  block?: boolean;
  shape?: SkeletonButtonShape;
  size?: SkeletonButtonSize;
  style?: ViewStyle;
  width?: DimensionValue;
}

const SkeletonButton = memo<SkeletonButtonProps>(
  ({ animated = false, size = 'middle', shape = 'default', block = false, width, style }) => {
    const { styles } = useStyles();
    const token = useTheme();
    const opacityInterpolation = useSkeletonAnimation(animated);

    // Memoize size map - matching Button component's base heights
    const sizeMap: Record<SkeletonButtonSize, number> = useMemo(
      () => ({
        large: token.controlHeightLG,
        middle: token.controlHeight,
        small: token.controlHeightSM,
      }),
      [token.controlHeightLG, token.controlHeight, token.controlHeightSM],
    );

    // Memoize calculated dimensions and styles
    const buttonDimensions = useMemo(() => {
      const baseHeight = sizeMap[size] ?? token.controlHeight;
      // Match Button component's 1.25x height multiplier
      const buttonHeight = baseHeight * 1.25;

      // Match Button component's border radius calculation
      // Default shape: height / 2.5, Circle shape: height * 2 (full round)
      const buttonBorderRadius = shape === 'circle' ? buttonHeight * 2 : buttonHeight / 2.5;

      let buttonWidth: DimensionValue = '50%';
      if (shape === 'circle') {
        // Match Button circle shape: height * 1.25
        buttonWidth = buttonHeight;
      } else if (block) {
        buttonWidth = '100%';
      } else if (width) {
        buttonWidth = width;
      }

      return {
        borderRadius: buttonBorderRadius,
        height: buttonHeight,
        width: buttonWidth as any,
      };
    }, [size, shape, block, width, sizeMap, token.controlHeight]);

    return (
      <Animated.View
        style={[
          styles.skeletonItem,
          styles.button,
          buttonDimensions,
          opacityInterpolation && { opacity: opacityInterpolation },
          style,
        ]}
        testID="skeleton-button"
      />
    );
  },
);

SkeletonButton.displayName = 'SkeletonButton';

export default SkeletonButton;
