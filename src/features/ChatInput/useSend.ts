import { useAnalytics } from '@lobehub/analytics/react';
import { useCallback, useMemo } from 'react';

import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors, topicSelectors } from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { getUserStoreState } from '@/store/user';
import { mentionSelectors, useMentionStore } from '@/store/mention';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { SendMessageParams } from '@/types/message';

export type UseSendMessageParams = Pick<
  SendMessageParams,
  'onlyAddUserMessage' | 'isWelcomeQuestion'
>;

export type UseSendGroupMessageParams = UseSendMessageParams & {
  targetMemberId?: string;
};

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);
  const { analytics } = useAnalytics();

  const clearChatUploadFileList = useFileStore((s) => s.clearChatUploadFileList);

  const isUploadingFiles = useFileStore(fileChatSelectors.isUploadingFiles);
  const isSendButtonDisabledByMessage = useChatStore(chatSelectors.isSendButtonDisabledByMessage);

  const canSend = !isUploadingFiles && !isSendButtonDisabledByMessage;

  const send = useCallback((params: UseSendMessageParams = {}) => {
    const store = useChatStore.getState();
    if (chatSelectors.isAIGenerating(store)) return;

    // if uploading file or send button is disabled by message, then we should not send the message
    const isUploadingFiles = fileChatSelectors.isUploadingFiles(useFileStore.getState());
    const isSendButtonDisabledByMessage = chatSelectors.isSendButtonDisabledByMessage(
      useChatStore.getState(),
    );

    const canSend = !isUploadingFiles && !isSendButtonDisabledByMessage;
    if (!canSend) return;

    const fileList = fileChatSelectors.chatUploadFileList(useFileStore.getState());
    // if there is no message and no image, then we should not send the message
    if (!store.inputMessage && fileList.length === 0) return;

    sendMessage({
      files: fileList,
      message: store.inputMessage,
      ...params,
    });

    updateInputMessage('');
    clearChatUploadFileList();

    // 获取分析数据
    const userStore = getUserStoreState();
    const agentStore = getAgentStoreState();

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
        message: store.inputMessage,
        message_length: store.inputMessage.length,
        message_type: messageType,
        selected_model: agentSelectors.currentAgentModel(agentStore),
        session_id: store.activeId || 'inbox', // 当前活跃的会话ID
        user_id: userStore.user?.id || 'anonymous',
      },
    });
    // const hasSystemRole = agentSelectors.hasSystemRole(useAgentStore.getState());
    // const agentSetting = useAgentStore.getState().agentSettingInstance;

    // // if there is a system role, then we need to use agent setting instance to autocomplete agent meta
    // if (hasSystemRole && !!agentSetting) {
    //   agentSetting.autocompleteAllMeta();
    // }
  }, []);

  return useMemo(() => ({ canSend, send }), [canSend]);
};

export const useSendGroupMessage = () => {
  const [sendGroupMessage, updateInputMessage] = useChatStore((s) => [
    s.sendGroupMessage,
    s.updateInputMessage,
  ]);
  const { analytics } = useAnalytics();

  const send = useCallback((params: UseSendGroupMessageParams = {}) => {
    const store = useChatStore.getState();
    if (!store.activeId) return;
    const fileList = fileChatSelectors.chatUploadFileList(useFileStore.getState());

    if (!store.inputMessage && fileList.length === 0) return;

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
    const messageWithMentions = `${store.inputMessage}${mentionText}`.trim();

    sendGroupMessage({
      files: fileList,
      groupId: store.activeId,
      message: messageWithMentions,
      targetMemberId: params.targetMemberId,
      ...params,
    });

    updateInputMessage('');
    useFileStore.getState().clearChatUploadFileList();
    // clear mentioned users after sending
    mentionState.clearMentionedUsers();

    // 获取分析数据
    const userStore = getUserStoreState();
    const agentStore = getAgentStoreState();
    const hasImages = fileList.some((file) => file.file?.type?.startsWith('image'));
    const messageType = fileList.length === 0 ? 'text' : hasImages ? 'image' : 'file';

    analytics?.track({
      name: 'send_message',
      properties: {
        chat_id: store.activeId || 'unknown',
        current_topic: topicSelectors.currentActiveTopic(store)?.title || null,
        has_attachments: fileList.length > 0,
        history_message_count: chatSelectors.activeBaseChats(store).length,
        message: store.inputMessage,
        message_length: store.inputMessage.length,
        message_type: messageType,
        selected_model: agentSelectors.currentAgentModel(agentStore),
        session_id: store.activeId || 'inbox', // 当前活跃的会话ID
        user_id: userStore.user?.id || 'anonymous',
      },
    });
  }, []);

  return useMemo(() => ({ send }), [send]);
};
