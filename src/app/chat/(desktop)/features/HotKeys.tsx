import isEqual from 'fast-deep-equal';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { CLEAN_MESSAGE_KEY, META_KEY, PREFIX_KEY, REGENERATE_KEY } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useFileStore } from '@/store/file';

const HotKeys = () => {
  const resendHotkeys = [PREFIX_KEY, REGENERATE_KEY].join('+');

  const [resendMessage, clearMessage] = useChatStore((s) => [s.resendMessage, s.clearMessage]);
  const lastMessage = useChatStore(chatSelectors.latestMessage, isEqual);

  const [clearImageList] = useFileStore((s) => [s.clearImageList]);
  const clearHotkeys = [META_KEY, PREFIX_KEY, CLEAN_MESSAGE_KEY].join('+');

  const resetConversation = useCallback(() => {
    clearMessage();
    clearImageList();
  }, []);

  useHotkeys(clearHotkeys, resetConversation, {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useHotkeys(
    resendHotkeys,
    () => {
      if (!lastMessage || lastMessage.id === 'default' || lastMessage.role === 'system') return;
      resendMessage(lastMessage.id);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  );

  return null;
};

export default HotKeys;
