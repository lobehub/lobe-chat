import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { filesSelectors, useFileStore } from '@/store/file';

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  return useCallback((onlyAddUserMessage?: boolean) => {
    const store = useChatStore.getState();
    if (!!store.chatLoadingId) return;
    if (!store.inputMessage) return;

    const imageList = filesSelectors.imageUrlOrBase64List(useFileStore.getState());

    sendMessage({
      files: imageList,
      message: store.inputMessage,
      onlyAddUserMessage: onlyAddUserMessage,
    });

    updateInputMessage('');
    useFileStore.getState().clearImageList();
  }, []);
};
