'use client';

import isEqual from 'fast-deep-equal';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { WELCOME_GUIDE_CHAT_ID } from '@/const/session';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { useInitConversation } from '../../hooks/useInitConversation';
import AutoScroll from '../AutoScroll';
import Item from '../ChatItem';
import InboxWelcome from '../InboxWelcome';
import SkeletonList from '../SkeletonList';

interface VirtualizedListProps {
  mobile?: boolean;
}
const VirtualizedList = memo<VirtualizedListProps>(({ mobile }) => {
  useInitConversation();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const [id, chatLoading] = useChatStore((s) => [
    chatSelectors.currentChatKey(s),
    chatSelectors.currentChatLoadingState(s),
  ]);

  const data = useChatStore((s) => {
    const showInboxWelcome = chatSelectors.showInboxWelcome(s);
    const ids = showInboxWelcome
      ? [WELCOME_GUIDE_CHAT_ID]
      : chatSelectors.currentChatIDsWithGuideMessage(s);
    return ['empty', ...ids];
  }, isEqual);

  useEffect(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ align: 'end', behavior: 'auto', index: 'LAST' });
    }
  }, [id]);

  const prevDataLengthRef = useRef(data.length);

  const getFollowOutput = useCallback(() => {
    const newFollowOutput = data.length > prevDataLengthRef.current ? 'auto' : false;
    prevDataLengthRef.current = data.length;
    return newFollowOutput;
  }, [data.length]);

  // overscan should be 1.5 times the height of the window
  const overscan = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 0;

  const itemContent = useCallback(
    (index: number, id: string) => {
      if (id === WELCOME_GUIDE_CHAT_ID) return <InboxWelcome />;

      return index === 0 ? (
        <div style={{ height: 24 + (mobile ? 0 : 64) }} />
      ) : (
        <Item id={id} index={index - 1} />
      );
    },
    [mobile],
  );

  return chatLoading ? (
    <SkeletonList mobile={mobile} />
  ) : (
    <Flexbox height={'100%'}>
      <Virtuoso
        atBottomStateChange={setAtBottom}
        atBottomThreshold={50 * (mobile ? 2 : 1)}
        computeItemKey={(_, item) => item}
        data={data}
        followOutput={getFollowOutput}
        // increaseViewportBy={overscan}
        initialTopMostItemIndex={data?.length - 1}
        isScrolling={setIsScrolling}
        itemContent={itemContent}
        overscan={overscan}
        ref={virtuosoRef}
      />
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
    </Flexbox>
  );
});

export default VirtualizedList;
