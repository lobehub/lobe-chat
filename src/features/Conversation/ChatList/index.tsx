'use client';

import { type ReactNode, memo, useCallback } from 'react';

import WideScreenContainer from '../../WideScreenContainer';
import MessageItem from '../Messages';
import SkeletonList from '../components/SkeletonList';
import { dataSelectors, useConversationStore } from '../store';
import VirtualizedList from './components/VirtualizedList';

export interface ChatListProps {
  /**
   * Custom item renderer. If not provided, uses default ChatItem.
   */
  itemContent?: (index: number, id: string) => ReactNode;
  /**
   * Welcome component to display when there are no messages
   */
  welcome?: ReactNode;
}

/**
 * ChatList component for Conversation
 *
 * Uses ConversationStore for message data and fetching.
 */
const ChatList = memo<ChatListProps>(({ welcome, itemContent }) => {
  // Fetch messages (SWR key is null when skipFetch is true)
  const context = useConversationStore((s) => s.context);
  const [skipFetch, useFetchMessages] = useConversationStore((s) => [
    dataSelectors.skipFetch(s),
    s.useFetchMessages,
  ]);
  useFetchMessages(context, skipFetch);

  // Use selectors for data
  const messagesInit = useConversationStore(dataSelectors.messagesInit);
  const displayMessageIds = useConversationStore(dataSelectors.displayMessageIds);

  const defaultItemContent = useCallback(
    (index: number, id: string) => {
      const isLatestItem = displayMessageIds.length === index + 1;
      return <MessageItem id={id} index={index} isLatestItem={isLatestItem} />;
    },
    [displayMessageIds.length],
  );

  if (!messagesInit) {
    return <SkeletonList />;
  }

  if (displayMessageIds.length === 0) {
    return (
      <WideScreenContainer
        style={{
          height: '100%',
        }}
        wrapperStyle={{
          minHeight: '100%',
          overflowY: 'auto',
        }}
      >
        {welcome}
      </WideScreenContainer>
    );
  }

  return (
    <VirtualizedList
      dataSource={displayMessageIds}
      // isGenerating={isGenerating}
      itemContent={itemContent ?? defaultItemContent}
    />
  );
});

ChatList.displayName = 'ConversationChatList';

export default ChatList;
