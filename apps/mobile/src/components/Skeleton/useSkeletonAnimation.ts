import { useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for Skeleton component animation
 * @param animated - Whether to enable animation
 * @returns Animated opacity value (or undefined if not animated)
 */
export const useSkeletonAnimation = (animated: boolean) => {
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

  // Memoize opacity interpolation
  const opacityInterpolation = useMemo(
    () =>
      animated
        ? shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          })
        : undefined,
    [animated, shimmerAnim],
  );

  return opacityInterpolation;
};
