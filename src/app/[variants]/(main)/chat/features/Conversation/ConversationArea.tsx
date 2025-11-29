'use client';

import { Suspense, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatList, ConversationProvider } from '@/features/Conversation';
import { useCurrentContext } from '@/hooks/useCurrentContext';
import { useOperationState } from '@/hooks/useOperationState';
import { useChatStore } from '@/store/chat';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

import ChatHydration from './ChatHydration';
import MainChatInput from './ChatInput';
import ChatMinimap from './ChatMinimap';
import MessageFromUrl from './MainChatInput/MessageFromUrl';
import ThreadHydration from './ThreadHydration';
// import WelcomeChatItem from './AgentWelcome';
import ZenModeToast from './ZenModeToast';
import { useActionsBarConfig } from './useActionsBarConfig';

interface ConversationAreaProps {
  mobile?: boolean;
}

/**
 * ConversationArea
 *
 * Main conversation area component using the new ConversationStore architecture.
 * Uses ChatList from @/features/Conversation and MainChatInput for custom features.
 */
const Conversation = memo<ConversationAreaProps>(({ mobile = false }) => {
  const context = useCurrentContext();

  // Get raw dbMessages from ChatStore for this context
  // ConversationStore will parse them internally to generate displayMessages
  const chatKey = useMemo(() => messageMapKey(context), [context.agentId, context.topicId]);
  const replaceMessages = useChatStore((s) => s.replaceMessages);
  const messages = useChatStore((s) => s.dbMessagesMap[chatKey]);

  // Get operation state from ChatStore for reactive updates
  const operationState = useOperationState(context);

  // Get actionsBar config with branching support from ChatStore
  const actionsBarConfig = useActionsBarConfig();

  return (
    <ConversationProvider
      context={context}
      hasInitMessages={!!messages}
      messages={messages}
      onMessagesChange={(messages) => {
        replaceMessages(messages, { context });
      }}
      operationState={operationState}
    >
      <ZenModeToast />
      <Flexbox
        flex={1}
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'relative',
        }}
        width={'100%'}
      >
        <ChatList
          actionsBar={actionsBarConfig}
          mobile={mobile}
          // welcome={<WelcomeChatItem />}
        />
      </Flexbox>
      <MainChatInput mobile={mobile} />
      <ChatHydration />
      <ThreadHydration />
      {!mobile && (
        <>
          <ChatMinimap />
          <Suspense>
            <MessageFromUrl />
          </Suspense>
        </>
      )}
    </ConversationProvider>
  );
});

Conversation.displayName = 'ConversationArea';

export default Conversation;
