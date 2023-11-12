import { useCallback } from 'react';

import { useSessionStore } from '@/store/session';

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useSessionStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  return useCallback(() => {
    const store = useSessionStore.getState();
    if (!!store.chatLoadingId) return;
    sendMessage(store.inputMessage);
    updateInputMessage('');
  }, []);
};
