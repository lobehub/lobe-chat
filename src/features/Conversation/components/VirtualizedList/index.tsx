'use client';

import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Loader2Icon } from 'lucide-react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { WELCOME_GUIDE_CHAT_ID } from '@/const/session';
import { isServerMode } from '@/const/version';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';

import AutoScroll from '../AutoScroll';
import Item from '../ChatItem';
import InboxWelcome from '../InboxWelcome';
import SkeletonList from '../SkeletonList';

interface VirtualizedListProps {
  mobile?: boolean;
}
const VirtualizedList = memo<VirtualizedListProps>(({ mobile }) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const [id] = useChatStore((s) => [chatSelectors.currentChatKey(s)]);

  const [activeTopicId, useFetchMessages, isFirstLoading] = useChatStore((s) => [
    s.activeTopicId,
    s.useFetchMessages,
    chatSelectors.currentChatLoadingState(s),
  ]);

  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const { isLoading } = useFetchMessages(sessionId, activeTopicId);

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

  const theme = useTheme();
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

  // first time loading
  if (isFirstLoading) return <SkeletonList mobile={mobile} />;

  // in server mode and switch page
  if (isServerMode && isLoading) return <SkeletonList mobile={mobile} />;

  // in client mode using the center loading for more
  return isLoading ? (
    <Center height={'100%'} width={'100%'}>
      <Icon
        icon={Loader2Icon}
        size={{ fontSize: 32 }}
        spin
        style={{ color: theme.colorTextTertiary }}
      />
    </Center>
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
