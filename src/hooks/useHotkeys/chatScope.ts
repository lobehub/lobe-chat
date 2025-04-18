import isEqual from 'fast-deep-equal';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { useClearCurrentMessages } from '@/features/ChatInput/ActionBar/Clear';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useActionSWR } from '@/libs/swr';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { HotkeyEnum, HotkeyScopeEnum } from '@/types/hotkey';

import { useHotkeyById } from './useHotkeyById';

export const useSaveTopicHotkey = () => {
  const openNewTopicOrSaveTopic = useChatStore((s) => s.openNewTopicOrSaveTopic);
  const { mutate } = useActionSWR('openNewTopicOrSaveTopic', openNewTopicOrSaveTopic);
  return useHotkeyById(HotkeyEnum.SaveTopic, () => mutate());
};

export const useToggleZenModeHotkey = () => {
  const toggleZenMode = useGlobalStore((s) => s.toggleZenMode);
  return useHotkeyById(HotkeyEnum.ToggleZenMode, toggleZenMode);
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
      enabled: !disable,
    },
  );
};

export const useToggleLeftPanelHotkey = () => {
  const isZenMode = useGlobalStore((s) => s.status.zenMode);
  const [isPinned] = useQueryState('pinned', parseAsBoolean);
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
      enabled: !isZenMode && !isPinned,
    },
  );
};

export const useToggleRightPanelHotkey = () => {
  const isZenMode = useGlobalStore((s) => s.status.zenMode);
  const toggleConfig = useGlobalStore((s) => s.toggleChatSideBar);

  return useHotkeyById(HotkeyEnum.ToggleRightPanel, () => toggleConfig(), {
    enabled: !isZenMode,
  });
};

export const useAddUserMessageHotkey = () => {
  const { send } = useSendMessage();
  return useHotkeyById(HotkeyEnum.AddUserMessage, () => send({ onlyAddUserMessage: true }));
};

export const useClearCurrentMessagesHotkey = () => {
  const clearCurrentMessages = useClearCurrentMessages();
  return useHotkeyById(HotkeyEnum.ClearCurrentMessages, () => clearCurrentMessages());
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
  useSaveTopicHotkey();
  useAddUserMessageHotkey();
  useClearCurrentMessagesHotkey();

  useEffect(() => {
    enableScope(HotkeyScopeEnum.Chat);
    return () => disableScope(HotkeyScopeEnum.Chat);
  }, []);

  return null;
};
