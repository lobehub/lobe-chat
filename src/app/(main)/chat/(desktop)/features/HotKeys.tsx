import isEqual from 'fast-deep-equal';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { ALT_KEY, CLEAN_MESSAGE_KEY, META_KEY, REGENERATE_KEY } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useFileStore } from '@/store/file';

const HotKeys = () => {
  const resendHotkeys = [ALT_KEY, REGENERATE_KEY].join('+');

  const [regenerateMessage, clearMessage] = useChatStore((s) => [
    s.regenerateMessage,
    s.clearMessage,
  ]);
  const lastMessage = useChatStore(chatSelectors.latestMessage, isEqual);

  const [clearImageList] = useFileStore((s) => [s.clearImageList]);
  const clearHotkeys = [META_KEY, ALT_KEY, CLEAN_MESSAGE_KEY].join('+');

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
      regenerateMessage(lastMessage.id);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  );

  return null;
};

export default HotKeys;
