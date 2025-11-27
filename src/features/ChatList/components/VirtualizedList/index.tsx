'use client';

import isEqual from 'fast-deep-equal';
import { ReactNode, memo, useCallback, useEffect, useRef, useState } from 'react';
import { VList, VListHandle } from 'virtua';

import WideScreenContainer from '@/features/ChatList/components/WideScreenContainer';
import { useChatStore } from '@/store/chat';
import { displayMessageSelectors } from '@/store/chat/selectors';

import AutoScroll from '../AutoScroll';
import SkeletonList from '../SkeletonList';
import { VirtuaContext, resetVirtuaVisibleItems, setVirtuaGlobalRef } from './VirtuosoContext';

interface VirtualizedListProps {
  dataSource: string[];
  itemContent: (index: number, data: any, context: any) => ReactNode;
  mobile?: boolean;
}

const VirtualizedList = memo<VirtualizedListProps>(({ mobile, dataSource, itemContent }) => {
  const virtuaRef = useRef<VListHandle>(null);
  const prevDataLengthRef = useRef(dataSource.length);
  const [atBottom, setAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  // eslint-disable-next-line no-undef
  const scrollEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isFirstLoading, isCurrentChatLoaded] = useChatStore((s) => [
    displayMessageSelectors.currentChatLoadingState(s),
    displayMessageSelectors.isCurrentDisplayChatLoaded(s),
  ]);

  const atBottomThreshold = 200 * (mobile ? 2 : 1);

  // Check if at bottom based on scroll position
  const checkAtBottom = useCallback(() => {
    const ref = virtuaRef.current;
    if (!ref) return false;

    const scrollOffset = ref.scrollOffset;
    const scrollSize = ref.scrollSize;
    const viewportSize = ref.viewportSize;

    return scrollSize - scrollOffset - viewportSize <= atBottomThreshold;
  }, [atBottomThreshold]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    // Check if at bottom
    const isAtBottom = checkAtBottom();
    setAtBottom(isAtBottom);

    // Clear existing timer
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
    }

    // Set new timer for scroll end
    scrollEndTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [checkAtBottom]);

  const handleScrollEnd = useCallback(() => {
    setIsScrolling(false);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const shouldScroll = dataSource.length > prevDataLengthRef.current;
    prevDataLengthRef.current = dataSource.length;

    if (shouldScroll && virtuaRef.current) {
      virtuaRef.current.scrollToIndex(dataSource.length - 2, { align: 'start', smooth: true });
    }
  }, [dataSource.length]);

  const scrollToBottom = useCallback(
    (behavior: 'auto' | 'smooth' = 'smooth') => {
      if (atBottom) return;
      if (!virtuaRef.current) return;
      virtuaRef.current.scrollToIndex(dataSource.length - 1, {
        align: 'end',
        smooth: behavior === 'smooth',
      });
    },
    [atBottom, dataSource.length],
  );

  useEffect(() => {
    setVirtuaGlobalRef(virtuaRef);

    return () => {
      setVirtuaGlobalRef(null);
    };
  }, [virtuaRef]);

  useEffect(() => {
    return () => {
      resetVirtuaVisibleItems();
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  // Scroll to bottom on initial render
  useEffect(() => {
    if (virtuaRef.current && dataSource.length > 0) {
      virtuaRef.current.scrollToIndex(dataSource.length - 1, { align: 'end' });
    }
  }, [isCurrentChatLoaded]);

  // first time loading or not loaded
  if (isFirstLoading || !isCurrentChatLoaded) return <SkeletonList mobile={mobile} />;

  return (
    <VirtuaContext value={virtuaRef}>
      <VList
        // bufferSize should be 2 times the height of the window
        bufferSize={typeof window !== 'undefined' ? window.innerHeight : 0}
        data={dataSource}
        onScroll={handleScroll}
        onScrollEnd={handleScrollEnd}
        ref={virtuaRef}
        reverse
        style={{ height: '100%' }}
      >
        {(data, index) => (
          <WideScreenContainer key={data} style={{ position: 'relative' }}>
            {itemContent(index, data, { virtuaRef })}
          </WideScreenContainer>
        )}
      </VList>

      <WideScreenContainer
        onChange={() => {
          if (!atBottom) return;
          setTimeout(scrollToBottom, 100);
        }}
        style={{
          position: 'relative',
        }}
      >
        <AutoScroll
          atBottom={atBottom}
          isScrolling={isScrolling}
          onScrollToBottom={(type) => {
            const virtua = virtuaRef.current;
            if (!virtua) return;

            switch (type) {
              case 'auto': {
                virtua.scrollToIndex(dataSource.length - 1, { align: 'end' });
                break;
              }
              case 'click': {
                virtua.scrollToIndex(dataSource.length - 1, { align: 'end', smooth: true });
                break;
              }
            }
          }}
        />
      </WideScreenContainer>
    </VirtuaContext>
  );
}, isEqual);

export default VirtualizedList;
