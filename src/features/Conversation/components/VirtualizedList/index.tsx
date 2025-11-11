'use client';

import isEqual from 'fast-deep-equal';
import {
  ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useChatStore } from '@/store/chat';
import { displayMessageSelectors } from '@/store/chat/selectors';

import AutoScroll from '../AutoScroll';
import SkeletonList from '../SkeletonList';
import {
  VirtuosoContext,
  resetVirtuosoVisibleItems,
  setVirtuosoGlobalRef,
} from './VirtuosoContext';

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

  const [isFirstLoading, isCurrentChatLoaded] = useChatStore((s) => [
    displayMessageSelectors.currentChatLoadingState(s),
    displayMessageSelectors.isCurrentDisplayChatLoaded(s),
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

  const components = useMemo(() => ({ List }), []);
  const computeItemKey = useCallback((index: number, item: string) => item, []);

  useEffect(() => {
    setVirtuosoGlobalRef(virtuosoRef);

    return () => {
      setVirtuosoGlobalRef(null);
    };
  }, [virtuosoRef]);

  useEffect(() => {
    return () => {
      resetVirtuosoVisibleItems();
    };
  }, []);

  // overscan should be 2 times the height of the window
  const overscan = typeof window !== 'undefined' ? window.innerHeight * 2 : 0;

  // first time loading or not loaded
  if (isFirstLoading || !isCurrentChatLoaded) return <SkeletonList mobile={mobile} />;

  return (
    <VirtuosoContext value={virtuosoRef}>
      <Virtuoso
        atBottomStateChange={setAtBottom}
        atBottomThreshold={200 * (mobile ? 2 : 1)}
        components={components}
        computeItemKey={computeItemKey}
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
            const virtuoso = virtuosoRef.current;
            switch (type) {
              case 'auto': {
                virtuoso?.scrollToIndex({ align: 'end', behavior: 'auto', index: 'LAST' });
                break;
              }
              case 'click': {
                virtuoso?.scrollToIndex({ align: 'end', behavior: 'smooth', index: 'LAST' });
                break;
              }
            }
          }}
        />
      </WideScreenContainer>
    </VirtuosoContext>
  );
}, isEqual);

export default VirtualizedList;
