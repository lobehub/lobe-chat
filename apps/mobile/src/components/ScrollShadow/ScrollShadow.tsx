import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { ScrollView } from 'react-native';

import { useStyles } from './style';
import type { ScrollShadowProps } from './type';
import { useScrollOverflow } from './useScrollOverflow';

const ScrollShadow = memo<ScrollShadowProps>(
  ({
    children,
    orientation = 'vertical',
    hideScrollBar = false,
    size = 40,
    offset = 0,
    visibility = 'auto',
    isEnabled = true,
    onVisibilityChange,
    style,
    ...rest
  }) => {
    const { styles } = useStyles();

    // 使用滚动检测钩子
    const { handleScroll, handleContentSizeChange, handleLayout, scrollState } = useScrollOverflow({
      isEnabled: isEnabled && visibility === 'auto',
      offset,
      onVisibilityChange,
      orientation,
    });

    // 决定最终的滚动状态
    const finalScrollState = useMemo(() => {
      if (visibility === 'always') {
        return {
          bottom: true,
          left: true,
          right: true,
          top: true,
        };
      }

      if (visibility === 'never') {
        return {
          bottom: false,
          left: false,
          right: false,
          top: false,
        };
      }

      return scrollState;
    }, [visibility, scrollState]);

    // 计算渐变配置
    const gradientConfig = useMemo(() => {
      const sizePercent = size / 100;

      if (orientation === 'vertical') {
        const { top, bottom } = finalScrollState;

        if (top && bottom) {
          // 上下都有阴影
          return {
            colors: ['transparent', 'black', 'black', 'transparent'] as const,
            end: { x: 0, y: 1 },
            locations: [0, sizePercent, 1 - sizePercent, 1] as const,
            start: { x: 0, y: 0 },
          };
        } else if (top) {
          // 只有顶部阴影
          return {
            colors: ['transparent', 'black'] as const,
            end: { x: 0, y: sizePercent },
            locations: [0, 1] as const,
            start: { x: 0, y: 0 },
          };
        } else if (bottom) {
          // 只有底部阴影
          return {
            colors: ['black', 'transparent'] as const,
            end: { x: 0, y: 1 },
            locations: [1 - sizePercent, 1] as const,
            start: { x: 0, y: 1 - sizePercent },
          };
        }
      } else {
        const { left, right } = finalScrollState;

        if (left && right) {
          // 左右都有阴影
          return {
            colors: ['transparent', 'black', 'black', 'transparent'] as const,
            end: { x: 1, y: 0 },
            locations: [0, sizePercent, 1 - sizePercent, 1] as const,
            start: { x: 0, y: 0 },
          };
        } else if (left) {
          // 只有左侧阴影
          return {
            colors: ['transparent', 'black'] as const,
            end: { x: sizePercent, y: 0 },
            locations: [0, 1] as const,
            start: { x: 0, y: 0 },
          };
        } else if (right) {
          // 只有右侧阴影
          return {
            colors: ['black', 'transparent'] as const,
            end: { x: 1, y: 0 },
            locations: [1 - sizePercent, 1] as const,
            start: { x: 1 - sizePercent, y: 0 },
          };
        }
      }

      // 无阴影
      return null;
    }, [orientation, finalScrollState, size]);

    const scrollViewProps = {
      horizontal: orientation === 'horizontal',
      onContentSizeChange: handleContentSizeChange,
      onLayout: handleLayout,
      onScroll: handleScroll,
      scrollEventThrottle: 16,
      showsHorizontalScrollIndicator: !hideScrollBar && orientation === 'horizontal',
      showsVerticalScrollIndicator: !hideScrollBar && orientation === 'vertical',
      ...rest,
    };

    // 如果没有阴影，直接返回 ScrollView
    if (!gradientConfig) {
      return (
        <ScrollView {...scrollViewProps} style={style}>
          {children}
        </ScrollView>
      );
    }

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
      >
        <ScrollView nestedScrollEnabled={true} {...scrollViewProps} style={styles.scrollView}>
          {children}
        </ScrollView>
      </MaskedView>
    );
  },
);

ScrollShadow.displayName = 'ScrollShadow';

export default ScrollShadow;
