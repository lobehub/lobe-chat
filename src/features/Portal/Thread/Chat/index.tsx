'use client';

import { Suspense, memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  ChatInput,
  ChatList,
  type ConversationContext,
  ConversationProvider,
  MessageItem,
} from '@/features/Conversation';
import SkeletonList from '@/features/Conversation/components/SkeletonList';
import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import ThreadDivider from './ThreadDivider';
import { useThreadActionsBarConfig } from './useThreadActionsBarConfig';

interface ThreadChatProps {
  mobile?: boolean;
}

/**
 * Thread Chat Component
 *
 * Uses ConversationProvider architecture for thread conversations.
 * Thread context is determined by:
 * - sessionId: current active session
 * - topicId: current active topic
 * - threadId: portal thread ID
 */
const ThreadChat = memo<ThreadChatProps>(({ mobile }) => {
  // Get thread context from ChatStore
  const [activeId, activeTopicId, portalThreadId] = useChatStore((s) => [
    s.activeId,
    s.activeTopicId,
    s.portalThreadId,
  ]);

  // Build ConversationContext for thread
  const context: ConversationContext = useMemo(
    () => ({
      sessionId: activeId,
      threadId: portalThreadId,
      topicId: activeTopicId,
    }),
    [activeId, activeTopicId, portalThreadId],
  );

  // Get thread messages from ChatStore (using existing selectors)
  // This includes parent messages + thread child messages
  const messages = useChatStore(threadSelectors.portalDisplayChats);

  // Get messages init status
  const isInit = useChatStore((s) => s.threadsInit);

  // Get thread source message info for ThreadDivider and parent message handling
  const threadSourceMessageId = useChatStore(threadSelectors.threadSourceMessageId);
  const threadSourceMessageIndex = useChatStore(threadSelectors.threadSourceMessageIndex);

  // Get thread-specific actionsBar config
  const actionsBarConfig = useThreadActionsBarConfig();

  // Custom item content renderer for thread-specific features
  const itemContent = useCallback(
    (index: number, id: string) => {
      // Check if this message needs ThreadDivider (after thread source message)
      const enableThreadDivider = threadSourceMessageId === id;

      // Check if this is a parent message (should be read-only)
      const isParentMessage = index <= threadSourceMessageIndex;

      return (
        <MessageItem
          actionsBar={actionsBarConfig}
          disableEditing={isParentMessage}
          endRender={enableThreadDivider ? <ThreadDivider /> : undefined}
          id={id}
          inPortalThread
          index={index}
        />
      );
    },
    [actionsBarConfig, threadSourceMessageId, threadSourceMessageIndex],
  );

  return (
    <ConversationProvider context={context} hasInitMessages={isInit} messages={messages}>
      <Suspense
        fallback={
          <Flexbox flex={1} height={'100%'}>
            <SkeletonList mobile={mobile} />
          </Flexbox>
        }
      >
        <Flexbox
          flex={1}
          style={{
            overflowX: 'hidden',
            overflowY: 'auto',
            position: 'relative',
          }}
          width={'100%'}
        >
          <ChatList itemContent={itemContent} mobile={mobile} />
        </Flexbox>
      </Suspense>
      <ChatInput leftActions={['typo', 'stt', 'portalToken']} />
    </ConversationProvider>
  );
});

ThreadChat.displayName = 'ThreadChat';

export default ThreadChat;
