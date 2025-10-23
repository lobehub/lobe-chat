import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface UseScrollOverflowProps {
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

export interface ScrollState {
  bottom: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
}

export const useScrollOverflow = ({
  isEnabled = true,
  offset = 0,
  onVisibilityChange,
  orientation = 'vertical',
}: UseScrollOverflowProps) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    bottom: false,
    left: false,
    right: false,
    top: false,
  });

  // 使用 useRef 存储尺寸和滚动位置，避免在 handleContentSizeChange/handleLayout 中丢失滚动状态
  const dimensionsRef = useRef({
    contentHeight: 0,
    contentWidth: 0,
    layoutHeight: 0,
    layoutWidth: 0,
    scrollX: 0,
    scrollY: 0,
  });

  const updateScrollState = useCallback(() => {
    if (!isEnabled) return;

    const { contentHeight, contentWidth, layoutHeight, layoutWidth, scrollX, scrollY } =
      dimensionsRef.current;

    const newState: ScrollState = {
      bottom: false,
      left: false,
      right: false,
      top: false,
    };

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

    setScrollState((prev) => {
      if (
        prev.top === newState.top &&
        prev.bottom === newState.bottom &&
        prev.left === newState.left &&
        prev.right === newState.right
      ) {
        return prev;
      }
      onVisibilityChange?.(newState);
      return newState;
    });
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
    (event: { nativeEvent: { layout: { height: number; width: number } } }) => {
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
