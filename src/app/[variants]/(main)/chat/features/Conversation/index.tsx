import { Flexbox, TooltipGroup } from '@lobehub/ui';
import { memo, useCallback } from 'react';

import DragUploadZone from '@/components/DragUploadZone';
import { useModelSupportVision } from '@/hooks/useModelSupportVision';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import ConversationArea from './ConversationArea';
import ChatHeader from './Header';

const ChatConversation = memo(() => {
  const showHeader = useGlobalStore(systemStatusSelectors.showChatHeader);

  // Get current agent's model info for vision support check
  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);
  const canUploadImage = useModelSupportVision(model, provider);
  const uploadFiles = useFileStore((s) => s.uploadChatFiles);

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      // Filter out image files if the model does not support vision
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
    <DragUploadZone onUploadFiles={handleUploadFiles} style={{ height: '100%', width: '100%' }}>
      <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
        {showHeader && <ChatHeader />}
        <TooltipGroup>
          <ConversationArea />
        </TooltipGroup>
      </Flexbox>
    </DragUploadZone>
  );
});

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
