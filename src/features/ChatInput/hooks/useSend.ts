import { useAnalytics } from '@lobehub/analytics/react';
import { useToolbarState } from '@lobehub/editor';
import { useMemo } from 'react';

import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors, topicSelectors } from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { getUserStoreState } from '@/store/user';
import { SendMessageParams } from '@/types/message';

import { useChatInput } from './useChatInput';

export interface UseSendMessageParams
  extends Pick<SendMessageParams, 'onlyAddUserMessage' | 'isWelcomeQuestion'> {
  onlyAddAIMessage?: boolean;
}

export const useSend = () => {
  const { editorRef, setExpand } = useChatInput();
  const { isEmpty } = useToolbarState(editorRef);
  const [updateInputMessage, sendMessage, addAIMessage, generating, stop] = useChatStore((s) => [
    s.updateInputMessage,
    s.sendMessage,
    s.addAIMessage,
    chatSelectors.isAIGenerating(s),
    s.stopGenerateMessage,
  ]);
  const { analytics } = useAnalytics();

  const clearChatUploadFileList = useFileStore((s) => s.clearChatUploadFileList);
  const fileList = fileChatSelectors.chatUploadFileList(useFileStore.getState());
  const isUploadingFiles = useFileStore(fileChatSelectors.isUploadingFiles);
  const isSendButtonDisabledByMessage = useChatStore(chatSelectors.isSendButtonDisabledByMessage);

  const canSend =
    (!isEmpty || fileList.length > 0) && !isUploadingFiles && !isSendButtonDisabledByMessage;

  const send = (params: UseSendMessageParams = {}) => {
    if (!canSend) return;
    const store = useChatStore.getState();
    if (chatSelectors.isAIGenerating(store)) return;
    const inputMessage = String(
      editorRef.current?.getDocument('markdown') || '',
    ).trimEnd() as unknown as string;

    // if there is no message and no image, then we should not send the message
    if (!inputMessage && fileList.length === 0) return;

    // TODO: 移除 updateInputMessage
    updateInputMessage(inputMessage);
    if (params.onlyAddAIMessage) {
      addAIMessage();
    } else {
      sendMessage({
        files: fileList,
        message: inputMessage,
        ...params,
      });
    }

    // TODO: 移除 updateInputMessage
    updateInputMessage('');
    clearChatUploadFileList();
    setExpand?.(false);
    editorRef.current?.setDocument('text', '');
    editorRef.current?.focus();

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
        message: inputMessage,
        message_length: inputMessage.length,
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
  };

  return useMemo(() => ({ canSend, generating, send, stop }), [canSend, send, generating, stop]);
};
