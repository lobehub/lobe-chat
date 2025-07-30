import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useThemeToken } from '@/mobile/theme';

import { useStyles } from './style';

interface LoadingDotsProps {
  color?: string;
  size?: number;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 8, color }) => {
  const token = useThemeToken();
  const dotColor = color || token.colorTextSecondary;
  const { styles } = useStyles(size, dotColor);

  // 创建三个动画值
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            duration: 400,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            duration: 400,
            toValue: 0.3,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    // 创建错开的动画
    const animation1 = createAnimation(dot1, 0);
    const animation2 = createAnimation(dot2, 150);
    const animation3 = createAnimation(dot3, 300);

    // 启动所有动画
    animation1.start();
    animation2.start();
    animation3.start();

    // 清理函数
    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

export default LoadingDots;
