import { useCallback, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { fileSelectors } from '@/store/file/selectors';
import { useFileStore } from '@/store/file/store';

export type UseSendMessageParams = {
  isWelcomeQuestion?: boolean;
  onlyAddUserMessage?: boolean;
};

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  // Get file upload state from file store (aligned with web)
  const isUploadingFiles = useFileStore(fileSelectors.isUploadingFiles);
  const isSendButtonDisabledByMessage = useChatStore(chatSelectors.isSendButtonDisabledByMessage);
  const isAIGenerating = useChatStore(chatSelectors.isAIGenerating);

  const canSend = !isUploadingFiles && !isSendButtonDisabledByMessage;
  // 分离 generating 状态，只基于 chatLoadingIds，与 web 端保持一致
  const generating = isAIGenerating;

  const send = useCallback(
    (params: UseSendMessageParams = {}) => {
      const store = useChatStore.getState();
      if (chatSelectors.isAIGenerating(store)) return;

      // if uploading file or send button is disabled by message, then we should not send the message
      const isSendButtonDisabledByMessage = chatSelectors.isSendButtonDisabledByMessage(
        useChatStore.getState(),
      );

      // Get file list from file store (aligned with web)
      const fileStore = useFileStore.getState();
      const isUploadingFiles = fileSelectors.isUploadingFiles(fileStore);

      const canSend = !isUploadingFiles && !isSendButtonDisabledByMessage;
      if (!canSend) return;

      // Get uploaded files (only send successfully uploaded files)
      const uploadFileList = fileSelectors.getChatUploadFileList(fileStore);
      const fileList = uploadFileList.filter((f) => f.status === 'success');

      // if there is no message and no files, then we should not send the message
      if (!store.inputMessage && fileList.length === 0) return;

      sendMessage({
        files: fileList,
        message: store.inputMessage,
        ...params,
      });

      // Clear input and file list after sending (aligned with web)
      updateInputMessage('');
      fileStore.clearChatUploadFileList();
    },
    [sendMessage, updateInputMessage],
  );

  return useMemo(() => ({ canSend, generating, send }), [canSend, generating, send]);
};
