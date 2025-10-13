import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface UseScrollOverflowProps {
  isEnabled?: boolean;
  offset?: number;
  onVisibilityChange?: (visibility: {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    top?: boolean;
  }) => void;
  orientation?: 'vertical' | 'horizontal';
}

export const useScrollOverflow = ({
  offset = 0,
  orientation = 'vertical',
  isEnabled = true,
  onVisibilityChange,
}: UseScrollOverflowProps) => {
  const [scrollState, setScrollState] = useState({
    bottom: false,
    left: false,
    right: false,
    top: false,
  });

  // 存储当前的尺寸信息
  const dimensionsRef = useRef({
    contentHeight: 0,
    contentWidth: 0,
    layoutHeight: 0,
    layoutWidth: 0,
    scrollX: 0,
    scrollY: 0,
  });

  // 计算并更新滚动状态
  const updateScrollState = useCallback(() => {
    if (!isEnabled) return;

    const { contentHeight, contentWidth, layoutHeight, layoutWidth, scrollX, scrollY } =
      dimensionsRef.current;

    const newState = { bottom: false, left: false, right: false, top: false };

    if (orientation === 'vertical') {
      const hasVerticalScroll = contentHeight > layoutHeight;

      if (hasVerticalScroll) {
        newState.top = scrollY > offset;
        newState.bottom = scrollY + layoutHeight < contentHeight - offset;
      }
    } else {
      const hasHorizontalScroll = contentWidth > layoutWidth;

      if (hasHorizontalScroll) {
        newState.left = scrollX > offset;
        newState.right = scrollX + layoutWidth < contentWidth - offset;
      }
    }

    setScrollState(newState);
    onVisibilityChange?.(newState);
  }, [isEnabled, offset, orientation, onVisibilityChange]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      dimensionsRef.current.scrollX = contentOffset.x;
      dimensionsRef.current.scrollY = contentOffset.y;
      updateScrollState();
    },
    [updateScrollState],
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      dimensionsRef.current.contentWidth = width;
      dimensionsRef.current.contentHeight = height;
      updateScrollState();
    },
    [updateScrollState],
  );

  const handleLayout = useCallback(
    (event: any) => {
      const { width, height } = event.nativeEvent.layout;
      dimensionsRef.current.layoutWidth = width;
      dimensionsRef.current.layoutHeight = height;
      updateScrollState();
    },
    [updateScrollState],
  );

  return {
    handleContentSizeChange,
    handleLayout,
    handleScroll,
    scrollState,
  };
};
