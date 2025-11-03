import { memo, useEffect } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useStyles } from '../style';

const Span: Components['span'] = memo(({ children, ...props }) => {
  const { styles } = useStyles();

  // Apply animation style for streaming text
  const className = (props as any).className;
  const isAnimated = className === 'animate-fade-in';

  // Animated value for fade-in effect
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isAnimated) {
      // Fade in animation: 0 -> 1 over 300ms
      opacity.value = withTiming(1, {
        duration: 300,
      });
    }
  }, [isAnimated, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!isAnimated) return {};
    return {
      opacity: opacity.value,
    };
  }, [isAnimated]);

  if (isAnimated) {
    return <Animated.Text style={[styles.text, animatedStyle]}>{children}</Animated.Text>;
  }

  return <Text style={styles.text}>{children}</Text>;
});

export default Span;
