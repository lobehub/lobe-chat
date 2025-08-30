import { IEditor } from '@lobehub/editor';
import { RefObject, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export const useAutoFocus = (inputRef: RefObject<IEditor | null>) => {
  const chatKey = useChatStore(chatSelectors.currentChatKey);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatKey]);
};
