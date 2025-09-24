import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Pressable } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { ButtonSize } from '@/components';

import { useThemeToken } from '@/theme';

interface StopLoadingIconProps {
  color?: string;
  duration?: number;
  onPress?: () => void;
  size?: ButtonSize;
}

const StopLoadingIcon: React.FC<StopLoadingIconProps> = ({
  size = 'middle',
  color,
  duration = 1000,
  onPress,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const token = useThemeToken();
  const iconColor = color || token.colorText;

  const realSize =
    size === 'small'
      ? token.controlHeightSM
      : size === 'middle'
        ? token.controlHeight
        : token.controlHeightLG;

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

  const strokeWidth = 2;
  const radius = (realSize - strokeWidth) / 2;
  const center = realSize / 2;
  const arcAngle = 140;
  const gapAngle = 360 - arcAngle;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcAngle / 360) * circumference;
  const gapLength = (gapAngle / 360) * circumference;

  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderRadius: realSize / 2,
        borderWidth: token.lineWidth,
        height: realSize,
        justifyContent: 'center',
        position: 'relative',
        width: realSize,
      }}
    >
      {/* 旋转的弧 */}
      <Animated.View
        style={[
          {
            height: realSize,
            position: 'absolute',
            width: realSize,
          },
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Svg height={realSize} width={realSize}>
          <Circle
            cx={center}
            cy={center}
            fill="none"
            r={radius}
            stroke={iconColor}
            strokeDasharray={`${arcLength},${gapLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
      </Animated.View>

      {/* 静止的方块 */}
      <View
        style={{
          height: realSize,
          position: 'absolute',
          width: realSize,
        }}
      >
        <Svg height={realSize} width={realSize}>
          <Rect
            fill={iconColor}
            height={realSize * 0.3}
            rx={2}
            width={realSize * 0.3}
            x={center - realSize * 0.15}
            y={center - realSize * 0.15}
          />
        </Svg>
      </View>
    </Pressable>
  );
};

export default StopLoadingIcon;
