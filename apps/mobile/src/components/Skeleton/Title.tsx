import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, ViewStyle } from 'react-native';

import { useStyles } from './style';

interface SkeletonTitleProps {
  animated?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  style?: ViewStyle;
  width?: DimensionValue;
}

const SkeletonTitle: React.FC<SkeletonTitleProps> = ({
  width = '60%',
  animated = false,
  style,
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

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        styles.titleLine,
        { width },
        animated && {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
        style,
      ]}
    />
  );
};

export default SkeletonTitle;
