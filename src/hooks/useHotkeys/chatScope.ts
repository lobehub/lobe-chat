import isEqual from 'fast-deep-equal';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { CHAT_HOTKEY_SCOPE } from '@/const/hotkeys';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useActionSWR } from '@/libs/swr';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { HotkeyEnum } from '@/types/hotkey';

import { useHotkeyById } from './useHotkeyById';

export const useSaveTopicHotkey = () => {
  const openNewTopicOrSaveTopic = useChatStore((s) => s.openNewTopicOrSaveTopic);
  const { mutate } = useActionSWR('openNewTopicOrSaveTopic', openNewTopicOrSaveTopic);
  return useHotkeyById(HotkeyEnum.SaveTopic, () => mutate(), { scopes: [CHAT_HOTKEY_SCOPE] });
};

export const useToggleZenModeHotkey = () => {
  const toggleZenMode = useGlobalStore((s) => s.toggleZenMode);
  return useHotkeyById(HotkeyEnum.ToggleZenMode, toggleZenMode, { scopes: [CHAT_HOTKEY_SCOPE] });
};

export const useOpenChatSettingsHotkey = () => {
  const openChatSettings = useOpenChatSettings();
  return useHotkeyById(HotkeyEnum.OpenChatSettings, openChatSettings, {
    scopes: [CHAT_HOTKEY_SCOPE],
  });
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
      scopes: [CHAT_HOTKEY_SCOPE],
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
      scopes: [CHAT_HOTKEY_SCOPE],
    },
  );
};

export const useToggleRightPanelHotkey = () => {
  const isZenMode = useGlobalStore((s) => s.status.zenMode);
  const toggleConfig = useGlobalStore((s) => s.toggleChatSideBar);

  return useHotkeyById(HotkeyEnum.ToggleRightPanel, () => toggleConfig(), {
    enabled: !isZenMode,
    scopes: [CHAT_HOTKEY_SCOPE],
  });
};

export const useAddUserMessageHotkey = () => {
  const { send } = useSendMessage();
  return useHotkeyById(HotkeyEnum.AddUserMessage, () => send({ onlyAddUserMessage: true }));
};
