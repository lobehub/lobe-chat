import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { useStyles } from './style';

interface StopLoadingIconProps {
  color?: string;
  duration?: number;
  size?: number;
}

const StopLoadingIcon: React.FC<StopLoadingIconProps> = ({
  size = 24,
  color = '#FFF',
  duration = 1000,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const { styles } = useStyles(size);

  useEffect(() => {
    rotateAnim.setValue(0);
    loopRef.current = Animated.loop(
      Animated.timing(rotateAnim, {
        duration,
        easing: Easing.linear,
        isInteraction: false,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    loopRef.current.start();
    return () => {
      if (loopRef.current) loopRef.current.stop();
    };
  }, [rotateAnim, duration]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const strokeWidth = 1.5;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const arcAngle = 140;
  const gapAngle = 360 - arcAngle;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcAngle / 360) * circumference;
  const gapLength = (gapAngle / 360) * circumference;

  return (
    <View pointerEvents="none" style={styles.container}>
      {/* 旋转的弧 */}
      <Animated.View
        style={[
          styles.rotatingContainer,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Svg height={size} width={size}>
          <Circle
            cx={center}
            cy={center}
            fill="none"
            r={radius}
            stroke={color}
            strokeDasharray={`${arcLength},${gapLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
      </Animated.View>

      {/* 静止的方块 */}
      <View style={styles.staticContainer}>
        <Svg height={size} width={size}>
          <Rect
            fill={color}
            height={size * 0.3}
            rx={2}
            width={size * 0.3}
            x={center - size * 0.15}
            y={center - size * 0.15}
          />
        </Svg>
      </View>
    </View>
  );
};

export default StopLoadingIcon;
