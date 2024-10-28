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

  const [activeTopicId, useFetchMessages, isFirstLoading, isCurrentChatLoaded] = useChatStore(
    (s) => [
      s.activeTopicId,
      s.useFetchMessages,
      chatSelectors.currentChatLoadingState(s),
      chatSelectors.isCurrentChatLoaded(s),
    ],
  );

  const [sessionId] = useSessionStore((s) => [s.activeId]);
  useFetchMessages(sessionId, activeTopicId);

  const data = useChatStore((s) => {
    const showInboxWelcome = chatSelectors.showInboxWelcome(s);
    return showInboxWelcome
      ? [WELCOME_GUIDE_CHAT_ID]
      : chatSelectors.currentChatIDsWithGuideMessage(s);
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
  // overscan should be 3 times the height of the window
  const overscan = typeof window !== 'undefined' ? window.innerHeight * 3 : 0;

  const itemContent = useCallback(
    (index: number, id: string) => {
      if (id === WELCOME_GUIDE_CHAT_ID) return <InboxWelcome />;

      return <Item id={id} index={index} />;
    },
    [mobile],
  );

  // first time loading or not loaded
  if (isFirstLoading) return <SkeletonList mobile={mobile} />;

  if (!isCurrentChatLoaded)
    // use skeleton list when not loaded in server mode due to the loading duration is much longer than client mode
    return isServerMode ? (
      <SkeletonList mobile={mobile} />
    ) : (
      // in client mode and switch page, using the center loading for smooth transition
      <Center height={'100%'} width={'100%'}>
        <Icon
          icon={Loader2Icon}
          size={{ fontSize: 32 }}
          spin
          style={{ color: theme.colorTextTertiary }}
        />
      </Center>
    );

  return (
    <Flexbox height={'100%'}>
      <Virtuoso
        atBottomStateChange={setAtBottom}
        atBottomThreshold={50 * (mobile ? 2 : 1)}
        computeItemKey={(_, item) => item}
        data={data}
        followOutput={getFollowOutput}
        increaseViewportBy={overscan}
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
