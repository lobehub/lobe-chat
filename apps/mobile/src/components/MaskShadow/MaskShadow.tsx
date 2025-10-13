import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';

import { useStyles } from './style';
import type { MaskShadowProps } from './type';

const MaskShadow = memo<MaskShadowProps>(
  ({ children, position = 'bottom', size = 40, style, ...rest }) => {
    const { styles } = useStyles();

    // 计算渐变配置
    const gradientConfig = useMemo(() => {
      const sizePercent = size / 100;

      switch (position) {
        case 'top': {
          return {
            colors: ['transparent', 'black'] as const,
            end: { x: 0, y: sizePercent },
            locations: [0, 1] as const,
            start: { x: 0, y: 0 },
          };
        }
        case 'bottom': {
          return {
            colors: ['black', 'transparent'] as const,
            end: { x: 0, y: 1 },
            locations: [1 - sizePercent, 1] as const,
            start: { x: 0, y: 1 - sizePercent },
          };
        }
        case 'left': {
          return {
            colors: ['transparent', 'black'] as const,
            end: { x: sizePercent, y: 0 },
            locations: [0, 1] as const,
            start: { x: 0, y: 0 },
          };
        }
        case 'right': {
          return {
            colors: ['black', 'transparent'] as const,
            end: { x: 1, y: 0 },
            locations: [1 - sizePercent, 1] as const,
            start: { x: 1 - sizePercent, y: 0 },
          };
        }
        default: {
          return {
            colors: ['black', 'transparent'] as const,
            end: { x: 0, y: 1 },
            locations: [1 - sizePercent, 1] as const,
            start: { x: 0, y: 1 - sizePercent },
          };
        }
      }
    }, [position, size]);

    return (
      <MaskedView
        maskElement={
          <LinearGradient
            colors={gradientConfig.colors}
            end={gradientConfig.end}
            locations={gradientConfig.locations}
            start={gradientConfig.start}
            style={styles.mask}
          />
        }
        style={[styles.container, style]}
        {...rest}
      >
        {children}
      </MaskedView>
    );
  },
);

MaskShadow.displayName = 'MaskShadow';

export default MaskShadow;
