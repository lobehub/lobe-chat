import isEqual from 'fast-deep-equal';
import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { useSend } from '@/app/[variants]/(main)/chat/(workspace)/@conversation/features/ChatInput/useSend';
import { useClearCurrentMessages } from '@/features/ChatInput/ActionBar/Clear';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useActionSWR } from '@/libs/swr';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { HotkeyEnum, HotkeyScopeEnum } from '@/types/hotkey';

import { usePinnedAgentState } from '../usePinnedAgentState';
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
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);
  const lastMessage = useChatStore(chatSelectors.latestMessage, isEqual);

  const disable = !lastMessage || lastMessage.id === 'default' || lastMessage.role === 'system';

  return useHotkeyById(
    HotkeyEnum.RegenerateMessage,
    () => !disable && regenerateMessage(lastMessage.id),
    {
      enableOnContentEditable: true,
      enabled: !disable,
    },
  );
};

export const useDeleteAndRegenerateMessageHotkey = () => {
  const delAndRegenerateMessage = useChatStore((s) => s.delAndRegenerateMessage);
  const lastMessage = useChatStore(chatSelectors.latestMessage, isEqual);

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
  const lastMessage = useChatStore(chatSelectors.latestMessage, isEqual);

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

export const useToggleLeftPanelHotkey = () => {
  const isZenMode = useGlobalStore((s) => s.status.zenMode);
  const [isPinned] = usePinnedAgentState();
  const showSessionPanel = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  return useHotkeyById(
    HotkeyEnum.ToggleLeftPanel,
    () =>
      updateSystemStatus({
        sessionsWidth: showSessionPanel ? 0 : 320,
        showSessionPanel: !showSessionPanel,
      }),
    {
      enableOnContentEditable: true,
      enabled: !isZenMode && !isPinned,
    },
  );
};

export const useToggleRightPanelHotkey = () => {
  const isZenMode = useGlobalStore((s) => s.status.zenMode);
  const toggleConfig = useGlobalStore((s) => s.toggleChatSideBar);

  return useHotkeyById(HotkeyEnum.ToggleRightPanel, () => toggleConfig(), {
    enableOnContentEditable: true,
    enabled: !isZenMode,
  });
};

export const useAddUserMessageHotkey = () => {
  const { send } = useSend();
  return useHotkeyById(
    HotkeyEnum.AddUserMessage,
    () => {
      send({ onlyAddUserMessage: true });
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
  useToggleLeftPanelHotkey();
  useToggleRightPanelHotkey();
  useToggleZenModeHotkey();

  // Conversation
  useRegenerateMessageHotkey();
  useDeleteAndRegenerateMessageHotkey();
  useDeleteLastMessageHotkey();
  useSaveTopicHotkey();
  useAddUserMessageHotkey();
  useClearCurrentMessagesHotkey();

  useEffect(() => {
    enableScope(HotkeyScopeEnum.Chat);
    return () => disableScope(HotkeyScopeEnum.Chat);
  }, []);
};
