import { useCallback, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { SendMessageParams } from '@/types/message';
import { parsePlaceholderVariables } from '@/utils/client/parserPlaceholder';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useAgentStore } from '@/store/agent';

export type UseSendMessageParams = Pick<
  SendMessageParams,
  'onlyAddUserMessage' | 'isWelcomeQuestion'
>;

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

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

    // 用户输入预处理
    const inputTemplate = agentChatConfigSelectors.currentChatConfig(useAgentStore.getState()).inputTemplate;
    const processedMessage = inputTemplate 
      ? parsePlaceholderVariables(inputTemplate.replace('{{input_template}}', store.inputMessage || ''))
      : store.inputMessage;

    // if there is no message and no image, then we should not send the message
    if (!processedMessage && fileList.length === 0) return;

    sendMessage({
      files: fileList,
      message: processedMessage,
      ...params,
    });

    updateInputMessage('');
    clearChatUploadFileList();

    // const hasSystemRole = agentSelectors.hasSystemRole(useAgentStore.getState());
    // const agentSetting = useAgentStore.getState().agentSettingInstance;

    // // if there is a system role, then we need to use agent setting instance to autocomplete agent meta
    // if (hasSystemRole && !!agentSetting) {
    //   agentSetting.autocompleteAllMeta();
    // }
  }, []);

  return useMemo(() => ({ canSend, send }), [canSend]);
};
