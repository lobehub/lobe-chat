import { memo, useMemo } from 'react';
import { Animated, ViewStyle } from 'react-native';

import { useStyles } from './style';
import { useSkeletonAnimation } from './useSkeletonAnimation';

interface SkeletonAvatarProps {
  animated?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  shape?: 'circle' | 'square';
  size?: number;
  style?: ViewStyle;
}

const SkeletonAvatar = memo<SkeletonAvatarProps>(
  ({ size = 36, shape = 'circle', animated = false, style }) => {
    const { styles, theme } = useStyles();
    const opacityInterpolation = useSkeletonAnimation(animated);

    // Memoize avatar style to avoid recalculation
    const avatarStyle = useMemo(
      () => ({
        borderRadius: shape === 'circle' ? size / 2 : theme.borderRadiusLG,
        height: size,
        width: size,
      }),
      [size, shape, theme.borderRadiusLG],
    );

    return (
      <Animated.View
        style={[
          styles.skeletonItem,
          avatarStyle,
          opacityInterpolation && { opacity: opacityInterpolation },
          style,
        ]}
        testID="skeleton-avatar"
      />
    );
  },
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

export default SkeletonAvatar;
