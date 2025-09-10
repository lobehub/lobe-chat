'use client';

import { ReactNode, forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import AutoScroll from '../AutoScroll';
import SkeletonList from '../SkeletonList';
import { VirtuosoContext } from './VirtuosoContext';

interface VirtualizedListProps {
  dataSource: string[];
  itemContent: (index: number, data: any, context: any) => ReactNode;
  mobile?: boolean;
}

const List = forwardRef(({ ...props }, ref) => {
  return (
    <Flexbox>
      <WideScreenContainer id={'chatlist-list'} ref={ref} {...props} />
    </Flexbox>
  );
});

const VirtualizedList = memo<VirtualizedListProps>(({ mobile, dataSource, itemContent }) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const prevDataLengthRef = useRef(dataSource.length);
  const [atBottom, setAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const [id, isFirstLoading, isCurrentChatLoaded] = useChatStore((s) => [
    chatSelectors.currentChatKey(s),
    chatSelectors.currentChatLoadingState(s),
    chatSelectors.isCurrentChatLoaded(s),
  ]);

  const getFollowOutput = useCallback(() => {
    const newFollowOutput = dataSource.length > prevDataLengthRef.current ? 'auto' : false;
    prevDataLengthRef.current = dataSource.length;
    return newFollowOutput;
  }, [dataSource.length]);

  const scrollToBottom = useCallback(
    (behavior: 'auto' | 'smooth' = 'smooth') => {
      if (atBottom) return;
      if (!virtuosoRef.current) return;
      virtuosoRef.current.scrollToIndex({ align: 'end', behavior, index: 'LAST' });
    },
    [atBottom],
  );

  useEffect(() => {
    scrollToBottom();
  }, [id]);

  // overscan should be 3 times the height of the window
  const overscan = typeof window !== 'undefined' ? window.innerHeight * 3 : 0;

  // first time loading or not loaded
  if (isFirstLoading || !isCurrentChatLoaded) return <SkeletonList mobile={mobile} />;

  return (
    <VirtuosoContext value={virtuosoRef}>
      <Virtuoso
        atBottomStateChange={setAtBottom}
        atBottomThreshold={50 * (mobile ? 2 : 1)}
        components={{
          List,
        }}
        computeItemKey={(_, item) => item}
        data={dataSource}
        followOutput={getFollowOutput}
        increaseViewportBy={overscan}
        initialTopMostItemIndex={dataSource?.length - 1}
        isScrolling={setIsScrolling}
        itemContent={itemContent}
        ref={virtuosoRef}
      />
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
            switch (type) {
              case 'auto': {
                scrollToBottom();
                break;
              }
              case 'click': {
                scrollToBottom('smooth');
                break;
              }
            }
          }}
        />
      </WideScreenContainer>
    </VirtuosoContext>
  );
});

export default VirtualizedList;
