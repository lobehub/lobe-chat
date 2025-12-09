import isEqual from 'fast-deep-equal';
import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { useClearCurrentMessages } from '@/features/ChatInput/ActionBar/Clear';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useActionSWR } from '@/libs/swr';
import { useChatStore } from '@/store/chat';
import { displayMessageSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { HotkeyEnum, HotkeyScopeEnum } from '@/types/hotkey';

import { useHotkeyById } from './useHotkeyById';

export const useSaveTopicHotkey = () => {
  const openNewTopicOrSaveTopic = useChatStore((s) => s.openNewTopicOrSaveTopic);
  const { mutate } = useActionSWR('openNewTopicOrSaveTopic', openNewTopicOrSaveTopic);
  return useHotkeyById(HotkeyEnum.SaveTopic, () => mutate(), { enableOnContentEditable: true });
};

export const useToggleZenModeHotkey = () => {
  const toggleZenMode = useGlobalStore((s) => s.toggleZenMode);
  return useHotkeyById(HotkeyEnum.ToggleZenMode, toggleZenMode, { enableOnContentEditable: true });
};

export const useOpenChatSettingsHotkey = () => {
  const openChatSettings = useOpenChatSettings();
  return useHotkeyById(HotkeyEnum.OpenChatSettings, openChatSettings);
};

export const useRegenerateMessageHotkey = () => {
  const [regenerateUserMessage, regenerateAssistantMessage] = useChatStore((s) => [
    s.regenerateUserMessage,
    s.regenerateAssistantMessage,
  ]);
  const lastMessage = useChatStore((s) => displayMessageSelectors.mainAIChats(s).at(-1), isEqual);

  const disable = !lastMessage;

  return useHotkeyById(
    HotkeyEnum.RegenerateMessage,
    () => {
      if (!lastMessage) return;
      if (lastMessage.role === 'user') return regenerateUserMessage(lastMessage.id);

      return regenerateAssistantMessage(lastMessage.id);
    },
    {
      enableOnContentEditable: true,
      enabled: !disable,
    },
  );
};

export const useDeleteAndRegenerateMessageHotkey = () => {
  const delAndRegenerateMessage = useChatStore((s) => s.delAndRegenerateMessage);
  const lastMessage = useChatStore((s) => displayMessageSelectors.mainAIChats(s).at(-1), isEqual);

  const disable = !lastMessage || lastMessage.id === 'default' || lastMessage.role === 'system';

  return useHotkeyById(
    HotkeyEnum.DeleteAndRegenerateMessage,
    () => !disable && delAndRegenerateMessage(lastMessage.id),
    {
      enableOnContentEditable: true,
      enabled: !disable,
    },
  );
};

export const useDeleteLastMessageHotkey = () => {
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const lastMessage = useChatStore((s) => displayMessageSelectors.mainAIChats(s).at(-1), isEqual);

  const disable = !lastMessage || lastMessage.id === 'default' || lastMessage.role === 'system';

  return useHotkeyById(
    HotkeyEnum.DeleteLastMessage,
    () => !disable && deleteMessage(lastMessage.id),
    {
      enableOnContentEditable: true,
      enabled: !disable,
    },
  );
};

export const useAddUserMessageHotkey = (send: () => void) => {
  return useHotkeyById(
    HotkeyEnum.AddUserMessage,
    () => {
      send();
    },
    {
      enableOnContentEditable: true,
    },
  );
};

export const useClearCurrentMessagesHotkey = () => {
  const clearCurrentMessages = useClearCurrentMessages();
  return useHotkeyById(HotkeyEnum.ClearCurrentMessages, () => clearCurrentMessages(), {
    enableOnContentEditable: true,
  });
};

// 注册聚合

export const useRegisterChatHotkeys = () => {
  const { enableScope, disableScope } = useHotkeysContext();

  // System
  useOpenChatSettingsHotkey();

  // Layout
  useToggleZenModeHotkey();

  // Conversation
  useRegenerateMessageHotkey();
  useDeleteAndRegenerateMessageHotkey();
  useDeleteLastMessageHotkey();
  useSaveTopicHotkey();
  useClearCurrentMessagesHotkey();

  useEffect(() => {
    enableScope(HotkeyScopeEnum.Chat);
    return () => disableScope(HotkeyScopeEnum.Chat);
  }, []);
};
