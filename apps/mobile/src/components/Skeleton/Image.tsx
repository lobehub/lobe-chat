import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useStyles } from './style';

interface SkeletonImageProps {
  animated?: boolean;
  height?: DimensionValue;
  iconColor?: string;
  iconSize?: number;
  shape?: 'circle' | 'square';
  showIcon?: boolean;
  style?: ViewStyle;
  width?: DimensionValue;
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({
  animated = false,
  width = '100%',
  height = 160,
  shape = 'square',
  style,
  iconSize,
  iconColor = '#D9D9D9',
  showIcon = true,
}) => {
  const { styles } = useStyles();
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

  const IMAGE_PLACEHOLDER_PATH =
    'M365.714286 329.142857q0 45.714286-32.036571 77.677714t-77.677714 32.036571-77.677714-32.036571-32.036571-77.677714 32.036571-77.677714 77.677714-32.036571 77.677714 32.036571 32.036571 77.677714zM950.857143 548.571429l0 256-804.571429 0 0-109.714286 182.857143-182.857143 91.428571 91.428571 292.571429-292.571429zM1005.714286 146.285714l-914.285714 0q-7.460571 0-12.873143 5.412571t-5.412571 12.873143l0 694.857143q0 7.460571 5.412571 12.873143t12.873143 5.412571l914.285714 0q7.460571 0 12.873143-5.412571t5.412571-12.873143l0-694.857143q0-7.460571-5.412571-12.873143t-12.873143-5.412571zM1097.142857 164.571429l0 694.857143q0 37.741714-26.843429 64.585143t-64.585143 26.843429l-914.285714 0q-37.741714 0-64.585143-26.843429t-26.843429-64.585143l0-694.857143q0-37.741714 26.843429-64.585143t64.585143-26.843429l914.285714 0q37.741714 0 64.585143 26.843429t26.843429 64.585143z';

  let extraBorderRadius: number | undefined;
  if (
    shape === 'circle' &&
    typeof width === 'number' &&
    typeof height === 'number' &&
    width === height
  ) {
    extraBorderRadius = width / 2;
  }

  const numericWidth = typeof width === 'number' ? width : undefined;
  const numericHeight = typeof height === 'number' ? height : undefined;
  const defaultIconSize =
    numericWidth && numericHeight ? Math.floor(Math.min(numericWidth, numericHeight) * 0.4) : 56;
  const finalIconSize = iconSize ?? defaultIconSize;
  const iconHeight = Math.round(finalIconSize * (1024 / 1098));

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        { alignItems: 'center', height, justifyContent: 'center', width },
        typeof extraBorderRadius === 'number' && { borderRadius: extraBorderRadius },
        animated && {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
        style,
      ]}
    >
      {showIcon && (
        <Svg height={iconHeight} viewBox="0 0 1098 1024" width={finalIconSize}>
          <Path d={IMAGE_PLACEHOLDER_PATH} fill={iconColor} />
        </Svg>
      )}
    </Animated.View>
  );
};

export default SkeletonImage;
