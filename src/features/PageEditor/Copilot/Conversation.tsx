import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ActionKeys } from '@/features/ChatInput';
import { ChatInput, ChatList } from '@/features/Conversation';

import TopicSelector from './TopicSeletor';

interface ConversationProps {
  agentId: string;
}
const actions: ActionKeys[] = ['model'];

const Conversation = memo<ConversationProps>(({ agentId }) => {
  return (
    <Flexbox flex={1} height={'100%'}>
      <TopicSelector agentId={agentId} />
      <Flexbox flex={1} style={{ overflow: 'hidden' }}>
        <ChatList />
      </Flexbox>
      <ChatInput leftActions={actions} />
    </Flexbox>
  );
});

export default Conversation;
