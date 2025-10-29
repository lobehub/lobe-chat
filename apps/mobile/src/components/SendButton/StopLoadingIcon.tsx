import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { useTheme } from '@/components/styles';

import { useStyles } from './style';

interface StopLoadingIconProps {
  /**
   * 图标颜色
   */
  color?: string;
  /**
   * 旋转动画时长（毫秒）
   * @default 1000
   */
  duration?: number;
  /**
   * 点击回调
   */
  onPress?: () => void;
  /**
   * 按钮尺寸
   */
  size?: number;
}

const StopLoadingIcon = memo<StopLoadingIconProps>(
  ({ size: customSize, color: customColor, duration = 1000, onPress }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);
    const token = useTheme();
    const { styles } = useStyles();

    const iconColor = customColor || token.colorText;
    const realSize = customSize || token.controlHeightSM;

    // 旋转动画效果
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
        style={[
          styles.stopButton,
          {
            borderRadius: realSize / 2,
            height: realSize,
            width: realSize,
          },
        ]}
      >
        {/* 旋转的弧 */}
        <Animated.View
          style={[
            styles.stopIcon,
            {
              height: realSize,
              transform: [{ rotate: spin }],
              width: realSize,
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
          style={[
            styles.stopIcon,
            {
              height: realSize,
              width: realSize,
            },
          ]}
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
  },
);

StopLoadingIcon.displayName = 'StopLoadingIcon';

export default StopLoadingIcon;
