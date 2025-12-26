import { type ReactNode, memo, useEffect, useMemo } from 'react';

import { ConversationProvider } from '@/features/Conversation';
import { useOperationState } from '@/hooks/useOperationState';
import { useChatStore } from '@/store/chat';
import { type MessageMapKeyInput, messageMapKey } from '@/store/chat/utils/messageMapKey';

interface AgentBuilderProviderProps {
  agentId: string;
  children: ReactNode;
}

/**
 * Agent Builder Conversation Provider
 * Provides context for the Agent Builder chat panel
 * Uses 'agent_builder' scope to isolate messages from main conversation
 */
const AgentBuilderProvider = memo<AgentBuilderProviderProps>(({ agentId, children }) => {
  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const switchTopic = useChatStore((s) => s.switchTopic);

  // Reset topicId on mount and unmount to avoid stale topicId leaking
  // when navigating from Profile page to agent conversation page
  useEffect(() => {
    // Mount: start with a fresh conversation (topicId = undefined)
    switchTopic(undefined, true);

    return () => {
      // Unmount: clean up topicId to prevent state leakage
      switchTopic(undefined, true);
    };
  }, [switchTopic]);

  // Build conversation context for agent builder
  // Using agent_builder scope for message management
  const context = useMemo<MessageMapKeyInput>(
    () => ({
      agentId,
      scope: 'agent_builder',
      topicId: activeTopicId,
    }),
    [agentId, activeTopicId],
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

export default AgentBuilderProvider;
