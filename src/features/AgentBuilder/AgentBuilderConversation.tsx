import { Flexbox } from '@lobehub/ui';
import { memo, useCallback } from 'react';

import DragUploadZone from '@/components/DragUploadZone';
import type { ActionKeys } from '@/features/ChatInput';
import { ChatInput, ChatList } from '@/features/Conversation';
import { useModelSupportVision } from '@/hooks/useModelSupportVision';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useFileStore } from '@/store/file';

import AgentBuilderWelcome from './AgentBuilderWelcome';
import TopicSelector from './TopicSelector';

interface AgentBuilderConversationProps {
  agentId: string;
}
const actions: ActionKeys[] = ['model'];

/**
 * Agent Builder Conversation Component
 * Displays the chat interface for configuring the agent via conversation
 */
const AgentBuilderConversation = memo<AgentBuilderConversationProps>(({ agentId }) => {
  // Get agent's model info for vision support check
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(agentId)(s));
  const provider = useAgentStore((s) => agentByIdSelectors.getAgentModelProviderById(agentId)(s));
  const canUploadImage = useModelSupportVision(model, provider);
  const uploadFiles = useFileStore((s) => s.uploadChatFiles);

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      const filteredFiles = files.filter((file) => {
        if (canUploadImage) return true;
        return !file.type.startsWith('image');
      });

      if (filteredFiles.length > 0) {
        uploadFiles(filteredFiles);
      }
    },
    [canUploadImage, uploadFiles],
  );

  return (
    <DragUploadZone onUploadFiles={handleUploadFiles} style={{ flex: 1, height: '100%' }}>
      <Flexbox flex={1} height={'100%'}>
        <TopicSelector agentId={agentId} />
        <Flexbox flex={1} style={{ overflow: 'hidden' }}>
          <ChatList welcome={<AgentBuilderWelcome />} />
        </Flexbox>
        <ChatInput leftActions={actions} />
      </Flexbox>
    </DragUploadZone>
  );
});

export default AgentBuilderConversation;
