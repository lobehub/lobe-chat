'use client';

import { Suspense, memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  ChatInput,
  ChatList,
  type ConversationContext,
  type ConversationHooks,
  ConversationProvider,
  MessageItem,
  conversationSelectors,
  useConversationStore,
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
 * Inner component that uses ConversationStore for message rendering
 * Must be inside ConversationProvider to access the store
 */
const ThreadChatContent = memo<{ mobile?: boolean }>(({ mobile }) => {
  // Get thread-specific actionsBar config
  const actionsBarConfig = useThreadActionsBarConfig();

  // Get display messages from ConversationStore to determine thread divider position
  // With the new backend API, parent messages have threadId === null
  // and thread messages have threadId === context.threadId
  const displayMessages = useConversationStore(conversationSelectors.displayMessages);

  // Find the last parent message (source message) - it's the last message with threadId === null
  const threadSourceInfo = useMemo(() => {
    // Find the index of the last parent message (threadId is null or undefined)
    let sourceMessageIndex = -1;
    let sourceMessageId: string | undefined;

    for (const [i, msg] of displayMessages.entries()) {
      // Parent messages don't have threadId
      if (!msg.threadId) {
        sourceMessageIndex = i;
        sourceMessageId = msg.id;
      }
    }

    return { sourceMessageId, sourceMessageIndex };
  }, [displayMessages]);

  // Custom item content renderer for thread-specific features
  const itemContent = useCallback(
    (index: number, id: string) => {
      // Check if this message needs ThreadDivider (after thread source message)
      const enableThreadDivider = threadSourceInfo.sourceMessageId === id;

      // Check if this is a parent message (should be read-only)
      // Parent messages are those with index <= sourceMessageIndex
      const isParentMessage = index <= threadSourceInfo.sourceMessageIndex;

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
    [actionsBarConfig, threadSourceInfo.sourceMessageId, threadSourceInfo.sourceMessageIndex],
  );

  return (
    <>
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
    </>
  );
});

ThreadChatContent.displayName = 'ThreadChatContent';

/**
 * Thread Chat Component
 *
 * Two modes:
 * 1. With portalThreadId: Uses ConversationProvider to fetch complete thread data from backend
 * 2. Without portalThreadId (creating new thread): Uses main conversation's displayMessages slice
 *
 * Thread context is determined by:
 * - agentId: current active agent
 * - topicId: current active topic
 * - threadId: portal thread ID (optional)
 */
const ThreadChat = memo<ThreadChatProps>(({ mobile }) => {
  // Get thread context from ChatStore
  const [activeAgentId, activeTopicId, portalThreadId, threadStartMessageId, newThreadMode] =
    useChatStore((s) => [
      s.activeAgentId,
      s.activeTopicId,
      s.portalThreadId,
      s.threadStartMessageId,
      s.newThreadMode,
    ]);

  // When creating new thread (no portalThreadId), get messages from main conversation
  // Use s.portalThreadId directly to avoid stale closure
  const messagesFromMain = useChatStore((s) =>
    !s.portalThreadId ? threadSelectors.portalDisplayChats(s) : undefined,
  );

  // Build ConversationContext for thread
  // When creating new thread (!portalThreadId), use isNew + scope: 'thread'
  const isCreatingNewThread = !portalThreadId && !!threadStartMessageId;

  const context: ConversationContext = useMemo(
    () => ({
      agentId: activeAgentId,
      // Use isNew + scope for new thread creation
      isNew: isCreatingNewThread,
      scope: 'thread',
      // Include source message info when creating a new thread
      sourceMessageId: isCreatingNewThread ? threadStartMessageId : undefined,
      threadId: portalThreadId,
      threadType: isCreatingNewThread ? newThreadMode : undefined,
      topicId: activeTopicId,
    }),
    [
      activeAgentId,
      activeTopicId,
      portalThreadId,
      threadStartMessageId,
      newThreadMode,
      isCreatingNewThread,
    ],
  );
  console.log('Thread Chat', context);

  // Hooks to handle post-message-creation tasks for new thread
  const hooks: ConversationHooks = useMemo(
    () => ({
      onAfterMessageCreate: async ({ createdThreadId }) => {
        if (!createdThreadId) return;

        const state = useChatStore.getState();

        // Refresh threads list
        await state.refreshThreads();
        // Refresh messages to include new thread messages
        await state.refreshMessages();
        // Open the newly created thread in portal
        state.openThreadInPortal(createdThreadId, threadStartMessageId);

        // Summarize thread title for new thread
        const portalThread = threadSelectors.currentPortalThread(useChatStore.getState());
        if (portalThread) {
          const chats = threadSelectors.portalAIChats(useChatStore.getState());
          await useChatStore.getState().summaryThreadTitle(portalThread.id, chats);
        }
      },
    }),
    [threadStartMessageId],
  );

  return (
    <ConversationProvider
      context={context}
      hooks={hooks}
      messages={messagesFromMain}
      skipFetch={!!messagesFromMain}
    >
      <ThreadChatContent mobile={mobile} />
    </ConversationProvider>
  );
});

ThreadChat.displayName = 'ThreadChat';

export default ThreadChat;
