import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, ViewStyle, View } from 'react-native';

import { useStyles } from './style';

interface SkeletonParagraphProps {
  animated?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  rows?: number;
  style?: ViewStyle;
  width?: DimensionValue | DimensionValue[];
}

const SkeletonParagraph: React.FC<SkeletonParagraphProps> = ({
  rows = 3,
  width,
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

  const lines = [] as React.ReactNode[];
  for (let i = 0; i < rows; i++) {
    let lineWidth: DimensionValue = '100%';

    if (Array.isArray(width)) {
      lineWidth = width[i] || '100%';
    } else if (width) {
      lineWidth = width;
    } else if (i === rows - 1) {
      lineWidth = '60%';
    }

    lines.push(
      <Animated.View
        key={i}
        style={[
          styles.skeletonItem,
          styles.paragraphLine,
          { width: lineWidth },
          i === rows - 1 && { marginBottom: 0 },
          animated && {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      />,
    );
  }

  return <View style={[styles.paragraphContainer, style]}>{lines}</View>;
};

export default SkeletonParagraph;
