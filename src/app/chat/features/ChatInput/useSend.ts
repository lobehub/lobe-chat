import { useCallback } from 'react';

import { filesSelectors, useFileStore } from '@/store/files';
import { useSessionStore } from '@/store/session';

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useSessionStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  return useCallback(() => {
    const store = useSessionStore.getState();
    if (!!store.chatLoadingId) return;
    const imageList = filesSelectors.imageUrlOrBase64List(useFileStore.getState());

    sendMessage(store.inputMessage, imageList);
    updateInputMessage('');
    useFileStore.getState().clearImageList();
  }, []);
};
