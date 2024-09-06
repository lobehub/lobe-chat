import { TextAreaRef } from 'antd/es/input/TextArea';
import { RefObject, useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export const useAutoFocus = (inputRef: RefObject<TextAreaRef>) => {
  const chatKey = useChatStore(chatSelectors.currentChatKey);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatKey]);
};
