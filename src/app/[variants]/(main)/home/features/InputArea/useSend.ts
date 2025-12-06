import { SESSION_CHAT_URL } from '@lobechat/const';
import { useState } from 'react';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { fileChatSelectors, useFileStore } from '@/store/file';

export const useSend = () => {
  const router = useQueryRoute();
  const inboxAgentId = useAgentStore(builtinAgentSelectors.inboxAgentId);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChatUploadFileList = useFileStore((s) => s.clearChatUploadFileList);
  const [loading, setLoading] = useState(false);

  const send = () => {
    const { inputMessage, mainInputEditor } = useChatStore.getState();
    const fileList = fileChatSelectors.chatUploadFileList(useFileStore.getState());

    if (!inputMessage && fileList.length === 0) return;
    if (!inboxAgentId) return;

    // 1. Set loading state
    setLoading(true);

    // 2. Send message with inbox agent context
    sendMessage({
      context: {
        agentId: inboxAgentId,
        threadId: undefined,
        topicId: undefined,
      },
      files: fileList,
      message: inputMessage,
    });

    // 3. Navigate to inbox agent first
    router.push(SESSION_CHAT_URL(inboxAgentId, false));

    // 4. Clear input and files after navigation
    clearChatUploadFileList();
    mainInputEditor?.clearContent();
  };

  return {
    inboxAgentId,
    loading,
    send,
  };
};
