import { memo, useEffect, useMemo } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cva, useTheme } from '@/components/styles';

import { useStyles } from './style';

interface SegmentedTextProps {
  isDisabled: boolean;
  isSelected: boolean;
  label: string;
  size: 'small' | 'middle' | 'large';
}

export const SegmentedText = memo<SegmentedTextProps>(({ isSelected, isDisabled, size, label }) => {
  const { styles } = useStyles();
  const token = useTheme();
  const colorProgress = useSharedValue(isSelected ? 1 : 0);

  // 使用 CVA 管理文本样式
  const textCva = useMemo(
    () =>
      cva(styles.textBase, {
        defaultVariants: {
          disabled: false,
          size: 'middle',
        },

        variants: {
          disabled: {
            false: null,
            true: styles.textDisabled,
          },
          size: {
            large: styles.textLarge,
            middle: styles.textMiddle,
            small: styles.textSmall,
          },
        },
      }),
    [styles],
  );

  useEffect(() => {
    colorProgress.value = withTiming(isSelected ? 1 : 0, {
      duration: 200,
    });
  }, [isSelected, colorProgress]);

  // 颜色动画
  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorProgress.value,
      [0, 1],
      [token.colorTextSecondary, token.colorText],
    );

    return {
      color,
    };
  });

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        textCva({
          disabled: isDisabled,
          size,
        }),
        !isDisabled && animatedTextStyle,
      ]}
    >
      {label}
    </Animated.Text>
  );
});

SegmentedText.displayName = 'SegmentedText';
