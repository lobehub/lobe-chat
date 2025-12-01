'use client';

import { type ReactNode, memo, useCallback } from 'react';

import MessageItem from '../Messages';
import SkeletonList from '../components/SkeletonList';
import VirtualizedList from '../components/VirtualizedList';
import WideScreenContainer from '../components/WideScreenContainer';
import { dataSelectors, useConversationStore } from '../store';
import type { ActionsBarConfig } from '../types';

export interface ChatListProps {
  /**
   * Actions bar configuration by message type.
   * Allows customizing which actions appear in the action bar and menu
   * for user and assistant messages.
   *
   * @example
   * ```tsx
   * actionsBar={{
   *   user: {
   *     bar: ['regenerate', 'edit'],
   *     menu: ['copy', 'del'],
   *   },
   *   assistant: {
   *     bar: ['copy', 'edit'],
   *     menu: ['regenerate', 'del', 'share'],
   *   },
   * }}
   * ```
   */
  actionsBar?: ActionsBarConfig;
  /**
   * Custom item renderer. If not provided, uses default ChatItem.
   */
  itemContent?: (index: number, id: string) => ReactNode;
  /**
   * Mobile mode
   */
  mobile?: boolean;
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
const ChatList = memo<ChatListProps>(({ actionsBar, mobile = false, welcome, itemContent }) => {
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
    (index: number, id: string) => <MessageItem actionsBar={actionsBar} id={id} index={index} />,
    [actionsBar],
  );

  if (!messagesInit) {
    return <SkeletonList mobile={mobile} />;
  }

  if (displayMessageIds.length === 0) {
    return (
      <WideScreenContainer flex={1} height={'100%'}>
        {welcome}
      </WideScreenContainer>
    );
  }

  return (
    <VirtualizedList
      dataSource={displayMessageIds}
      // isGenerating={isGenerating}
      itemContent={itemContent ?? defaultItemContent}
      mobile={mobile}
    />
  );
});

ChatList.displayName = 'ConversationChatList';

export default ChatList;
