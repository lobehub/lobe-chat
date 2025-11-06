import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, memo, useCallback, useMemo, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { ScrollView } from 'react-native';

import { useStyles } from './style';
import type { ScrollShadowProps } from './type';
import { useScrollOverflow } from './useScrollOverflow';

const ScrollShadowInner = (props: ScrollShadowProps, forwardedRef: any) => {
  const {
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
  } = props;

  const { styles } = useStyles();
  const scrollRef = useRef<ScrollView>(null);

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
          end: { x: 0, y: 1 },
          locations: [0, sizePercent] as const,
          start: { x: 0, y: 0 },
        };
      } else if (bottom) {
        // 只有底部阴影
        return {
          colors: ['black', 'transparent'] as const,
          end: { x: 0, y: 1 },
          locations: [1 - sizePercent, 1] as const,
          start: { x: 0, y: 0 },
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
          end: { x: 1, y: 0 },
          locations: [0, sizePercent] as const,
          start: { x: 0, y: 0 },
        };
      } else if (right) {
        // 只有右侧阴影
        return {
          colors: ['black', 'transparent'] as const,
          end: { x: 1, y: 0 },
          locations: [1 - sizePercent, 1] as const,
          start: { x: 0, y: 0 },
        };
      }
    }

    // 无阴影
    return null;
  }, [orientation, finalScrollState, size]);

  // 合并外部传入的事件处理器
  const mergedOnScroll = useCallback(
    (event: any) => {
      handleScroll(event);
      rest.onScroll?.(event);
    },
    [handleScroll, rest.onScroll],
  );

  const mergedOnContentSizeChange = useCallback(
    (w: number, h: number) => {
      handleContentSizeChange(w, h);
      rest.onContentSizeChange?.(w, h);
    },
    [handleContentSizeChange, rest.onContentSizeChange],
  );

  const mergedOnLayout = useCallback(
    (event: any) => {
      handleLayout(event);
      rest.onLayout?.(event);
    },
    [handleLayout, rest.onLayout],
  );

  const scrollViewProps = {
    ...rest,
    horizontal: orientation === 'horizontal',
    onContentSizeChange: mergedOnContentSizeChange,
    onLayout: mergedOnLayout,
    onScroll: mergedOnScroll,
    scrollEventThrottle: 16,
    showsHorizontalScrollIndicator: !hideScrollBar && orientation === 'horizontal',
    showsVerticalScrollIndicator: !hideScrollBar && orientation === 'vertical',
  };

  // 如果没有阴影，直接返回 ScrollView
  if (!gradientConfig) {
    return (
      <ScrollView
        ref={mergeRefs([scrollRef, forwardedRef])}
        removeClippedSubviews={true}
        style={style}
        {...scrollViewProps}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
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
      <ScrollView
        nestedScrollEnabled={true}
        ref={mergeRefs([scrollRef, forwardedRef])}
        {...scrollViewProps}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {children}
      </ScrollView>
    </MaskedView>
  );
};

const ScrollShadow = memo(forwardRef(ScrollShadowInner));

ScrollShadow.displayName = 'ScrollShadow';

export default ScrollShadow;
