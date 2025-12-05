import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatInput, ChatList } from '@/features/Conversation';

import TopicSelector from './TopicSelector';

interface AgentBuilderConversationProps {
  agentId: string;
}

/**
 * Agent Builder Conversation Component
 * Displays the chat interface for configuring the agent via conversation
 */
const AgentBuilderConversation = memo<AgentBuilderConversationProps>(({ agentId }) => {
  return (
    <Flexbox flex={1} height={'100%'}>
      <Flexbox align="center" horizontal justify="flex-end" paddingBlock={8} paddingInline={12}>
        <TopicSelector agentId={agentId} />
      </Flexbox>
      <Flexbox flex={1} style={{ overflow: 'hidden' }}>
        <ChatList />
      </Flexbox>
      <ChatInput leftActions={['model']} />
    </Flexbox>
  );
});

export default AgentBuilderConversation;
