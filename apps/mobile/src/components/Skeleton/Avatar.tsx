import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

import { useStyles } from './style';

interface SkeletonAvatarProps {
  animated?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  shape?: 'circle' | 'square';
  size?: number;
  style?: ViewStyle;
}

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  shape = 'circle',
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

  const avatarStyle = {
    borderRadius: shape === 'circle' ? size / 2 : 6,
    height: size,
    width: size,
  };

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        avatarStyle,
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

export default SkeletonAvatar;
