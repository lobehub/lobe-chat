import { Flexbox } from '@lobehub/ui';
import { memo, useEffect, useState } from 'react';

import DragUploadZone, { useUploadFiles } from '@/components/DragUploadZone';
import type { ActionKeys } from '@/features/ChatInput';
import { ChatInput, ChatList } from '@/features/Conversation';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';

import CopilotToolbar from './Toolbar';
import Welcome from './Welcome';

interface ConversationProps {
  agentId: string;
}
const actions: ActionKeys[] = ['model', 'search'];

const Conversation = memo<ConversationProps>(({ agentId }) => {
  const [activeAgentId, setActiveAgentId] = useAgentStore((s) => [
    s.activeAgentId,
    s.setActiveAgentId,
  ]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setActiveAgentId(agentId);
    // Also set the chat store's activeAgentId so topic selectors can work correctly
    useChatStore.setState({ activeAgentId: agentId });
  }, [agentId, setActiveAgentId]);

  const currentAgentId = activeAgentId || agentId;

  // Get agent's model info for vision support check
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(currentAgentId)(s));
  const provider = useAgentStore((s) =>
    agentByIdSelectors.getAgentModelProviderById(currentAgentId)(s),
  );
  const { handleUploadFiles } = useUploadFiles({ model, provider });

  return (
    <DragUploadZone
      onUploadFiles={handleUploadFiles}
      style={{ flex: 1, height: '100%', minWidth: 300 }}
    >
      <Flexbox
        flex={1}
        height={'100%'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CopilotToolbar agentId={currentAgentId} isHovered={isHovered} />
        <Flexbox flex={1} style={{ overflow: 'hidden' }}>
          <ChatList welcome={<Welcome />} />
        </Flexbox>
        <ChatInput leftActions={actions} />
      </Flexbox>
    </DragUploadZone>
  );
});

export default Conversation;
