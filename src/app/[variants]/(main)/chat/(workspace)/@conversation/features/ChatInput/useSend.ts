import { useAnalytics } from '@lobehub/analytics/react';
import { useMemo } from 'react';

import { useGeminiChineseWarning } from '@/hooks/useGeminiChineseWarning';
import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { getChatStoreState, useChatStore } from '@/store/chat';
import { aiChatSelectors, chatSelectors, topicSelectors } from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { getUserStoreState } from '@/store/user';

export interface UseSendMessageParams {
  isWelcomeQuestion?: boolean;
  onlyAddAIMessage?: boolean;
  onlyAddUserMessage?: boolean;
}

export const useSend = () => {
  const [
    isContentEmpty,
    sendMessage,
    addAIMessage,
    stopGenerateMessage,
    cancelSendMessageInServer,
    generating,
    isSendButtonDisabledByMessage,
    isSendingMessage,
  ] = useChatStore((s) => [
    !s.inputMessage,
    s.sendMessage,
    s.addAIMessage,
    s.stopGenerateMessage,
    s.cancelSendMessageInServer,
    chatSelectors.isAIGenerating(s),
    chatSelectors.isSendButtonDisabledByMessage(s),
    aiChatSelectors.isCurrentSendMessageLoading(s),
  ]);
  const { analytics } = useAnalytics();
  const checkGeminiChineseWarning = useGeminiChineseWarning();

  const fileList = fileChatSelectors.chatUploadFileList(useFileStore.getState());
  const [isUploadingFiles, clearChatUploadFileList] = useFileStore((s) => [
    fileChatSelectors.isUploadingFiles(s),
    s.clearChatUploadFileList,
  ]);

  const isInputEmpty = isContentEmpty && fileList.length === 0;

  const canNotSend =
    isInputEmpty || isUploadingFiles || isSendButtonDisabledByMessage || isSendingMessage;

  const handleSend = async (params: UseSendMessageParams = {}) => {
    if (canNotSend) return;

    const store = useChatStore.getState();
    const mainInputEditor = store.mainInputEditor;

    if (!mainInputEditor) {
      console.warn('not found mainInputEditor instance');
      return;
    }

    if (chatSelectors.isAIGenerating(store)) return;

    const inputMessage = store.inputMessage;

    // if there is no message and no image, then we should not send the message
    if (!inputMessage && fileList.length === 0) return;

    // Check for Chinese text warning with Gemini model
    const agentStore = getAgentStoreState();
    const currentModel = agentSelectors.currentAgentModel(agentStore);
    const shouldContinue = await checkGeminiChineseWarning({
      model: currentModel,
      prompt: inputMessage,
      scenario: 'chat',
    });

    if (!shouldContinue) return;

    if (params.onlyAddAIMessage) {
      addAIMessage();
    } else {
      sendMessage({ files: fileList, message: inputMessage, ...params });
    }

    clearChatUploadFileList();
    mainInputEditor.setExpand(false);
    mainInputEditor.clearContent();
    mainInputEditor.focus();

    // 获取分析数据
    const userStore = getUserStoreState();

    // 直接使用现有数据结构判断消息类型
    const hasImages = fileList.some((file) => file.file?.type?.startsWith('image'));
    const messageType = fileList.length === 0 ? 'text' : hasImages ? 'image' : 'file';

    analytics?.track({
      name: 'send_message',
      properties: {
        chat_id: store.activeId || 'unknown',
        current_topic: topicSelectors.currentActiveTopic(store)?.title || null,
        has_attachments: fileList.length > 0,
        history_message_count: chatSelectors.activeBaseChats(store).length,
        message: inputMessage,
        message_length: inputMessage.length,
        message_type: messageType,
        selected_model: agentSelectors.currentAgentModel(agentStore),
        session_id: store.activeId || 'inbox', // 当前活跃的会话ID
        user_id: userStore.user?.id || 'anonymous',
      },
    });
  };

  const stop = () => {
    const store = getChatStoreState();
    const generating = chatSelectors.isAIGenerating(store);

    if (generating) {
      stopGenerateMessage();
      return;
    }

    const isCreatingMessage = aiChatSelectors.isCurrentSendMessageLoading(store);

    if (isCreatingMessage) {
      cancelSendMessageInServer();
    }
  };

  return useMemo(
    () => ({
      disabled: canNotSend,
      generating: generating || isSendingMessage,
      send: handleSend,
      stop,
    }),
    [canNotSend, generating, isSendingMessage, stop, handleSend],
  );
};
