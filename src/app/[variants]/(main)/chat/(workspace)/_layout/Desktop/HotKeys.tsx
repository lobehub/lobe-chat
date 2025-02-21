'use client';

import isEqual from 'fast-deep-equal';
import { useHotkeys } from 'react-hotkeys-hook';

import { HOTKEYS } from '@/const/hotkeys';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';

const HotKeys = () => {
  const [regenerateMessage] = useChatStore((s) => [s.regenerateMessage]);
  const lastMessage = useChatStore(chatSelectors.latestMessage, isEqual);

  const toggleZenMode = useGlobalStore((s) => s.toggleZenMode);
  const openChatSettings = useOpenChatSettings();

  useHotkeys(HOTKEYS.zenMode, toggleZenMode, {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useHotkeys(HOTKEYS.chatSettings, () => openChatSettings(), {
    enableOnFormTags: false,
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
