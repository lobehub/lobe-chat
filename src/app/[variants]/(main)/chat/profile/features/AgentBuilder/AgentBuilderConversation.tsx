import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ActionKeys } from '@/features/ChatInput';
import { ChatInput, ChatList } from '@/features/Conversation';

const actions: ActionKeys[] = ['model'];

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
      <ChatInput leftActions={actions} />
    </Flexbox>
  );
});

export default AgentBuilderConversation;
