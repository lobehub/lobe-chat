import { memo, useEffect, useState } from 'react';
import {
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/components/styles';

import Icon from '../Icon';
import type { IconProps } from '../Icon';

interface SegmentedIconProps {
  icon: IconProps['icon'];
  isDisabled: boolean;
  isSelected: boolean;
  size: number;
}

export const SegmentedIcon = memo<SegmentedIconProps>(({ icon, isSelected, isDisabled, size }) => {
  const token = useTheme();
  const colorProgress = useSharedValue(isSelected ? 1 : 0);
  const [color, setColor] = useState(isSelected ? token.colorText : token.colorTextSecondary);

  useEffect(() => {
    colorProgress.value = withTiming(isSelected ? 1 : 0, {
      duration: 200,
    });
  }, [isSelected, colorProgress]);

  // 将动画颜色同步到状态
  useAnimatedReaction(
    () => {
      return interpolateColor(
        colorProgress.value,
        [0, 1],
        [token.colorTextSecondary, token.colorText],
      );
    },
    (result) => {
      runOnJS(setColor)(result);
    },
  );

  return <Icon color={isDisabled ? token.colorTextDisabled : color} icon={icon} size={size} />;
});

SegmentedIcon.displayName = 'SegmentedIcon';
