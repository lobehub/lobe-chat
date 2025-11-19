import { useAnalytics } from '@lobehub/analytics/react';
import { useCallback, useMemo } from 'react';

import { useGeminiChineseWarning } from '@/hooks/useGeminiChineseWarning';
import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { getChatStoreState, useChatStore } from '@/store/chat';
import {
  aiChatSelectors,
  displayMessageSelectors,
  messageStateSelectors,
  operationSelectors,
  topicSelectors,
} from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { mentionSelectors, useMentionStore } from '@/store/mention';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { getUserStoreState } from '@/store/user';

export interface UseSendMessageParams {
  isWelcomeQuestion?: boolean;
  onlyAddAIMessage?: boolean;
  onlyAddUserMessage?: boolean;
}

export type UseSendGroupMessageParams = UseSendMessageParams & {
  targetMemberId?: string;
};

export const useSend = () => {
  const [
    isContentEmpty,
    sendMessage,
    addAIMessage,
    stopGenerateMessage,
    cancelSendMessageInServer,
    isAgentRuntimeRunning,
    isSendButtonDisabledByMessage,
    isSendingMessage,
  ] = useChatStore((s) => [
    !s.inputMessage,
    s.sendMessage,
    s.addAIMessage,
    s.stopGenerateMessage,
    s.cancelSendMessageInServer,
    operationSelectors.isMainWindowAgentRuntimeRunning(s),
    messageStateSelectors.isSendButtonDisabledByMessage(s),
    aiChatSelectors.isCurrentSendMessageLoading(s),
  ]);
  const { analytics } = useAnalytics();
  const checkGeminiChineseWarning = useGeminiChineseWarning();

  // 使用订阅以保持最新文件列表
  const reactiveFileList = useFileStore(fileChatSelectors.chatUploadFileList);
  const [isUploadingFiles, clearChatUploadFileList] = useFileStore((s) => [
    fileChatSelectors.isUploadingFiles(s),
    s.clearChatUploadFileList,
  ]);

  const isInputEmpty = isContentEmpty && reactiveFileList.length === 0;

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

    if (operationSelectors.isMainWindowAgentRuntimeRunning(store)) return;

    const inputMessage = store.inputMessage;
    // 发送时再取一次最新的文件列表，防止闭包拿到旧值
    const fileList = fileChatSelectors.chatUploadFileList(useFileStore.getState());

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

    // 直接使用现有数据结构判断消息类型（支持 video）
    const hasImages = fileList.some((file) => file.file?.type?.startsWith('image'));
    const hasVideos = fileList.some((file) => file.file?.type?.startsWith('video'));
    const messageType =
      fileList.length === 0 ? 'text' : hasVideos ? 'video' : hasImages ? 'image' : 'file';

    analytics?.track({
      name: 'send_message',
      properties: {
        chat_id: store.activeId || 'unknown',
        current_topic: topicSelectors.currentActiveTopic(store)?.title || null,
        has_attachments: fileList.length > 0,
        history_message_count: displayMessageSelectors.activeDisplayMessages(store).length,
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
    const isRunning = operationSelectors.isMainWindowAgentRuntimeRunning(store);

    if (isRunning) {
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
      generating: isAgentRuntimeRunning || isSendingMessage,
      send: handleSend,
      stop,
    }),
    [canNotSend, isAgentRuntimeRunning, isSendingMessage, stop, handleSend],
  );
};

export const useSendGroupMessage = () => {
  const [
    isContentEmpty,
    sendGroupMessage,
    updateMessageInput,
    stopGenerateMessage,
    isSendButtonDisabledByMessage,
    isCreatingMessage,
  ] = useChatStore((s) => [
    !s.inputMessage,
    s.sendGroupMessage,
    s.updateMessageInput,
    s.stopGenerateMessage,
    messageStateSelectors.isSendButtonDisabledByMessage(s),
    messageStateSelectors.isCreatingMessage(s),
  ]);

  const isSupervisorThinking = useChatStore((s) =>
    displayMessageSelectors.isSupervisorLoading(s.activeId)(s),
  );
  const { analytics } = useAnalytics();
  const checkGeminiChineseWarning = useGeminiChineseWarning();

  const fileList = fileChatSelectors.chatUploadFileList(useFileStore.getState());
  const [isUploadingFiles, clearChatUploadFileList] = useFileStore((s) => [
    fileChatSelectors.isUploadingFiles(s),
    s.clearChatUploadFileList,
  ]);

  const isInputEmpty = isContentEmpty && fileList.length === 0;

  const canNotSend =
    isInputEmpty ||
    isUploadingFiles ||
    isSendButtonDisabledByMessage ||
    isCreatingMessage ||
    isSupervisorThinking;

  const handleSend = useCallback(
    async (params: UseSendGroupMessageParams = {}) => {
      if (canNotSend) return;

      const store = useChatStore.getState();
      if (!store.activeId) return;

      const mainInputEditor = store.mainInputEditor;
      if (!mainInputEditor) {
        console.warn('not found mainInputEditor instance');
        return;
      }

      if (
        displayMessageSelectors.isSupervisorLoading(store.activeId)(store) ||
        messageStateSelectors.isCreatingMessage(store)
      )
        return;

      const inputMessage = store.inputMessage;

      // if there is no message and no files, then we should not send the message
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

      // Append mentioned users as plain text like "@userName"
      const mentionState = useMentionStore.getState();
      const mentioned = mentionSelectors.mentionedUsers(mentionState);
      const sessionState = useSessionStore.getState();
      const mentionText =
        mentioned.length > 0
          ? ` ${mentioned
              .map((id) => sessionMetaSelectors.getAgentMetaByAgentId(id)(sessionState).title || id)
              .map((name) => `@${name}`)
              .join(' ')}`
          : '';
      const messageWithMentions = `${inputMessage}${mentionText}`.trim();

      sendGroupMessage({
        files: fileList,
        groupId: store.activeId,
        message: messageWithMentions,
        targetMemberId: params.targetMemberId,
        ...params,
      });

      clearChatUploadFileList();
      mainInputEditor.setExpand(false);
      mainInputEditor.clearContent();
      mainInputEditor.focus();
      updateMessageInput('');
      // clear mentioned users after sending
      mentionState.clearMentionedUsers();

      // 获取分析数据
      const userStore = getUserStoreState();
      const hasImages = fileList.some((file) => file.file?.type?.startsWith('image'));
      const messageType = fileList.length === 0 ? 'text' : hasImages ? 'image' : 'file';

      analytics?.track({
        name: 'send_group_message',
        properties: {
          chat_id: store.activeId || 'unknown',
          current_topic: topicSelectors.currentActiveTopic(store)?.title || null,
          has_attachments: fileList.length > 0,
          history_message_count: displayMessageSelectors.activeDisplayMessages(store).length,
          message: inputMessage,
          message_length: inputMessage.length,
          message_type: messageType,
          selected_model: agentSelectors.currentAgentModel(agentStore),
          session_id: store.activeId || 'inbox', // 当前活跃的会话ID
          user_id: userStore.user?.id || 'anonymous',
        },
      });
    },
    [
      canNotSend,
      fileList,
      clearChatUploadFileList,
      updateMessageInput,
      analytics,
      checkGeminiChineseWarning,
    ],
  );

  const stop = useCallback(() => {
    const store = getChatStoreState();
    const isAgentRunning = operationSelectors.isMainWindowAgentRuntimeRunning(store);
    const isCreating = messageStateSelectors.isCreatingMessage(store);

    if (isAgentRunning) {
      stopGenerateMessage();
      return;
    }

    if (isCreating) {
      // For group messages, we don't have a separate cancel method like in single chat
      // The isCreatingMessage state will be reset when the operation completes
      // We can potentially add a cancel group message functionality in the future
      console.warn('Group message creation in progress, cannot cancel');
    }
  }, [stopGenerateMessage]);

  return useMemo(
    () => ({
      disabled: canNotSend,
      generating: isSupervisorThinking || isCreatingMessage,
      send: handleSend,
      stop,
      updateMessageInput,
    }),
    [canNotSend, isSupervisorThinking, isCreatingMessage, handleSend, stop, updateMessageInput],
  );
};
