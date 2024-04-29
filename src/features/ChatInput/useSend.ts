import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { SendMessageParams } from '@/store/chat/slices/message/action';
import { filesSelectors, useFileStore } from '@/store/file';

export type UseSendMessageParams = Pick<
  SendMessageParams,
  'onlyAddUserMessage' | 'isWelcomeQuestion'
>;

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  return useCallback((params: UseSendMessageParams = {}) => {
    const store = useChatStore.getState();
    if (!!store.chatLoadingId) return;
    if (!store.inputMessage) return;

    const imageList = filesSelectors.imageUrlOrBase64List(useFileStore.getState());

    sendMessage({
      files: imageList,
      message: store.inputMessage,
      ...params,
    });

    updateInputMessage('');
    useFileStore.getState().clearImageList();
  }, []);
};
