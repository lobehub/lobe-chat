'use client';

import isEqual from 'fast-deep-equal';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { HOTKEYS } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';

const HotKeys = () => {
  const [regenerateMessage, clearMessage] = useChatStore((s) => [
    s.regenerateMessage,
    s.clearMessage,
  ]);
  const lastMessage = useChatStore(chatSelectors.latestMessage, isEqual);

  const [clearImageList] = useFileStore((s) => [s.clearChatUploadFileList]);
  const toggleZenMode = useGlobalStore((s) => s.toggleZenMode);

  const resetConversation = useCallback(() => {
    clearMessage();
    clearImageList();
  }, []);

  useHotkeys(HOTKEYS.clear, resetConversation, {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useHotkeys(HOTKEYS.zenMode, toggleZenMode, {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useHotkeys(
    HOTKEYS.regenerate,
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
