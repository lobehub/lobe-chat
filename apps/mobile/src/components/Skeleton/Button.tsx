import { memo, useEffect, useRef } from 'react';
import { Animated, DimensionValue, ViewStyle } from 'react-native';

import { useTheme } from '@/components/styles';

import { useStyles } from './style';

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
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (animated) {
        const shimmerAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnim, {
              duration: 1000,
              toValue: 1,
              useNativeDriver: false,
            }),
            Animated.timing(shimmerAnim, {
              duration: 1000,
              toValue: 0,
              useNativeDriver: false,
            }),
          ]),
        );
        shimmerAnimation.start();
        return () => shimmerAnimation.stop();
      }
    }, [animated, shimmerAnim]);

    const sizeMap: Record<SkeletonButtonSize, number> = {
      large: token.controlHeightLG,
      middle: token.controlHeight,
      small: token.controlHeightSM,
    };

    const buttonHeight = sizeMap[size] ?? token.controlHeight;
    const buttonBorderRadius = shape === 'circle' ? buttonHeight / 2 : token.borderRadius;

    let buttonWidth: DimensionValue = '50%';
    if (shape === 'circle') {
      buttonWidth = buttonHeight;
    } else if (block) {
      buttonWidth = '100%';
    } else if (width) {
      buttonWidth = width;
    }

    return (
      <Animated.View
        style={[
          styles.skeletonItem,
          styles.button,
          {
            borderRadius: buttonBorderRadius,
            height: buttonHeight,
            width: buttonWidth as any,
          },
          animated && {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
          style,
        ]}
        testID="skeleton-button"
      />
    );
  },
);

SkeletonButton.displayName = 'SkeletonButton';

export default SkeletonButton;
