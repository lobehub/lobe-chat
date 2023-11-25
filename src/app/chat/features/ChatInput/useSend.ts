import { useCallback } from 'react';

import { filesSelectors, useFileStore } from '@/store/files';
import { useChatStore } from 'src/store/chat';

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  return useCallback(() => {
    const store = useChatStore.getState();
    if (!!store.chatLoadingId) return;
    const imageList = filesSelectors.imageUrlOrBase64List(useFileStore.getState());

    sendMessage(store.inputMessage, imageList);
    updateInputMessage('');
    useFileStore.getState().clearImageList();
  }, []);
};
