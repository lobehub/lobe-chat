import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatInput, ChatList } from '@/features/Conversation';

/**
 * Agent Builder Conversation Component
 * Displays the chat interface for configuring the agent via conversation
 */
const AgentBuilderConversation = memo(() => {
  return (
    <Flexbox flex={1} height={'100%'}>
      <Flexbox flex={1} height={'100%'}>
        <ChatList />
      </Flexbox>
      <ChatInput />
    </Flexbox>
  );
});

export default AgentBuilderConversation;
