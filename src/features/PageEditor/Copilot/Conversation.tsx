import { memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ActionKeys } from '@/features/ChatInput';
import { ChatInput, ChatList } from '@/features/Conversation';
import { useAgentStore } from '@/store/agent';

import CopilotToolbar from './Toolbar';

interface ConversationProps {
  agentId: string;
}
const actions: ActionKeys[] = ['model'];

const Conversation = memo<ConversationProps>(({ agentId }) => {
  const [activeAgentId, setActiveAgentId] = useAgentStore((s) => [
    s.activeAgentId,
    s.setActiveAgentId,
  ]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setActiveAgentId(agentId);
  }, [agentId, setActiveAgentId]);

  const currentAgentId = activeAgentId || agentId;

  return (
    <Flexbox
      flex={1}
      height={'100%'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CopilotToolbar agentId={currentAgentId} isHovered={isHovered} />
      <Flexbox flex={1} style={{ overflow: 'hidden' }}>
        <ChatList />
      </Flexbox>
      <ChatInput leftActions={actions} />
    </Flexbox>
  );
});

export default Conversation;
