import { useCallback, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export type UseSendMessageParams = {
  isWelcomeQuestion?: boolean;
  onlyAddUserMessage?: boolean;
};

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  // Mobile端暂时没有文件上传功能，所以isUploadingFiles始终为false
  const isUploadingFiles = false;
  const isSendButtonDisabledByMessage = useChatStore(chatSelectors.isSendButtonDisabledByMessage);

  const canSend = !isUploadingFiles && !isSendButtonDisabledByMessage;

  const send = useCallback(
    (params: UseSendMessageParams = {}) => {
      const store = useChatStore.getState();
      if (chatSelectors.isAIGenerating(store)) return;

      // if uploading file or send button is disabled by message, then we should not send the message
      const isSendButtonDisabledByMessage = chatSelectors.isSendButtonDisabledByMessage(
        useChatStore.getState(),
      );

      const canSend = !isUploadingFiles && !isSendButtonDisabledByMessage;
      if (!canSend) return;

      // Mobile端暂时没有文件列表，传空数组
      const fileList: any[] = [];

      // if there is no message and no files, then we should not send the message
      if (!store.inputMessage && fileList.length === 0) return;

      sendMessage({
        files: fileList,
        message: store.inputMessage,
        ...params,
      });

      updateInputMessage('');
    },
    [sendMessage, updateInputMessage, isUploadingFiles],
  );

  return useMemo(() => ({ canSend, send }), [canSend, send]);
};
