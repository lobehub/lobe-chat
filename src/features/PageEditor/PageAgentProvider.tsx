import { ReactNode, memo, useMemo } from 'react';

import { ConversationProvider } from '@/features/Conversation';
import { useOperationState } from '@/hooks/useOperationState';
import { useChatStore } from '@/store/chat';
import { MessageMapKeyInput, messageMapKey } from '@/store/chat/utils/messageMapKey';

interface PageAgentProviderProps {
  children: ReactNode;
  pageAgentId: string;
}
const PageAgentProvider = memo<PageAgentProviderProps>(({ pageAgentId, children }) => {
  const activeTopicId = useChatStore((s) => s.activeTopicId);

  // Build conversation context for page agent
  // Using topic dimension for message management (1 agent can have multiple topics)
  const context = useMemo<MessageMapKeyInput>(
    () => ({
      agentId: pageAgentId,
      scope: 'page',
      topicId: activeTopicId, // No topic initially, can be extended later
    }),
    [pageAgentId, activeTopicId],
  );

  // Get messages from ChatStore based on context
  const chatKey = useMemo(
    () => (context ? messageMapKey(context) : null),
    [context?.agentId, context?.topicId],
  );
  const replaceMessages = useChatStore((s) => s.replaceMessages);
  const messages = useChatStore((s) => (chatKey ? s.dbMessagesMap[chatKey] : undefined));

  // Get operation state for reactive updates
  const operationState = useOperationState(context);

  return (
    <ConversationProvider
      context={context}
      hasInitMessages={!!messages}
      messages={messages}
      onMessagesChange={(msgs) => {
        replaceMessages(msgs, { context });
      }}
      operationState={operationState}
    >
      {children}
    </ConversationProvider>
  );
});

export default PageAgentProvider;
