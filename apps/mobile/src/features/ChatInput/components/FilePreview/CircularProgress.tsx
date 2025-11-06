import { memo } from 'react';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/components/styles';

interface CircularProgressProps {
  percent?: number;
  size?: number;
}

/**
 * CircularProgress - Simple circular progress indicator
 * Aligned with antd's Progress circle type
 */
const CircularProgress = memo<CircularProgressProps>(({ percent = 0, size = 14 }) => {
  const theme = useTheme();

  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Svg height={size} width={size}>
      {/* Background circle */}
      <Circle
        cx={center}
        cy={center}
        fill="none"
        r={radius}
        stroke={theme.colorBorder}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <Circle
        cx={center}
        cy={center}
        fill="none"
        r={radius}
        stroke={theme.colorInfo}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
});

CircularProgress.displayName = 'CircularProgress';

export default CircularProgress;
