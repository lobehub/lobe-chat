import { memo, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import Flexbox from '../Flexbox';
import { useTheme } from '../styles';
import { useStyles } from './style';
import type { LoadingDotsProps } from './type';

const LoadingDots = memo<LoadingDotsProps>(({ size = 8, color, variant = 'pulse', style }) => {
  const token = useTheme();
  const dotColor = color || token.colorPrimary;
  const { styles } = useStyles(size, dotColor);

  // 创建动画值
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animations: Animated.CompositeAnimation[] = [];

    switch (variant) {
      case 'pulse': {
        // 脉冲效果：所有点同时缩放
        animations = [
          Animated.loop(
            Animated.sequence([
              Animated.timing(dot1, {
                duration: 600,
                toValue: 1,
                useNativeDriver: true,
              }),
              Animated.timing(dot1, {
                duration: 600,
                toValue: 0,
                useNativeDriver: true,
              }),
            ]),
          ),
        ];
        dot2.setValue(0);
        dot3.setValue(0);
        break;
      }

      case 'wave': {
        // 波浪效果：从左到右的平滑波浪
        animations = [dot1, dot2, dot3].map((animValue, index) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(index * 120),
              Animated.timing(animValue, {
                duration: 500,
                toValue: 1,
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                duration: 500,
                toValue: 0,
                useNativeDriver: true,
              }),
              Animated.delay((2 - index) * 120),
            ]),
          ),
        );
        break;
      }

      case 'orbit': {
        // 轨道效果：点围绕中心旋转
        animations = [
          Animated.loop(
            Animated.timing(dot1, {
              duration: 1200,
              toValue: 1,
              useNativeDriver: true,
            }),
          ),
        ];
        dot2.setValue(0);
        dot3.setValue(0);
        break;
      }

      case 'typing': {
        // 打字效果：模拟打字机
        animations = [dot1, dot2, dot3].map((animValue, index) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(index * 150),
              Animated.timing(animValue, {
                duration: 200,
                toValue: 1,
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                duration: 200,
                toValue: 0,
                useNativeDriver: true,
              }),
              Animated.delay((2 - index) * 150 + 300),
            ]),
          ),
        );
        break;
      }
      default: {
        // 默认效果：渐变透明度
        animations = [dot1, dot2, dot3].map((animValue, index) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(index * 150),
              Animated.timing(animValue, {
                duration: 400,
                toValue: 1,
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                duration: 400,
                toValue: 0,
                useNativeDriver: true,
              }),
              Animated.delay((2 - index) * 150),
            ]),
          ),
        );
      }
    }

    // 启动所有动画
    animations.forEach((anim) => anim.start());

    // 清理函数
    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [dot1, dot2, dot3, variant]);

  // 根据变体渲染不同的视觉效果
  const renderDots = () => {
    switch (variant) {
      case 'pulse': {
        return (
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      }

      case 'wave': {
        return (
          <>
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      translateY: dot1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -size * 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      translateY: dot2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -size * 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      translateY: dot3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -size * 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          </>
        );
      }

      case 'orbit': {
        return (
          <>
            <Animated.View
              style={[
                styles.dot,
                styles.orbitDot,
                {
                  transform: [
                    {
                      rotate: dot1.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                    { translateX: size * 2 },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                styles.orbitDot,
                {
                  transform: [
                    {
                      rotate: dot1.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['120deg', '480deg'],
                      }),
                    },
                    { translateX: size * 2 },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                styles.orbitDot,
                {
                  transform: [
                    {
                      rotate: dot1.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['240deg', '600deg'],
                      }),
                    },
                    { translateX: size * 2 },
                  ],
                },
              ]}
            />
          </>
        );
      }

      case 'typing': {
        return (
          <>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 1],
                  }),
                  transform: [
                    {
                      scale: dot1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 1],
                  }),
                  transform: [
                    {
                      scale: dot2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 1],
                  }),
                  transform: [
                    {
                      scale: dot3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          </>
        );
      }

      default: {
        return (
          <>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
          </>
        );
      }
    }
  };

  return (
    <Flexbox
      align="center"
      horizontal
      padding={4}
      style={[variant === 'orbit' ? styles.orbitContainer : styles.container, style]}
    >
      {renderDots()}
    </Flexbox>
  );
});

LoadingDots.displayName = 'LoadingDots';

export default LoadingDots;
