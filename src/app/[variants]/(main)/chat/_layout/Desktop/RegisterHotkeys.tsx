'use client';

import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { CHAT_HOTKEY_SCOPE } from '@/const/hotkeys';
import {
  useAddUserMessageHotkey,
  useOpenChatSettingsHotkey,
  useRegenerateMessageHotkey,
  useSaveTopicHotkey,
  useToggleLeftPanelHotkey,
  useToggleRightPanelHotkey,
  useToggleZenModeHotkey,
} from '@/hooks/useHotkeys';

const RegisterHotkeys = () => {
  const { enableScope } = useHotkeysContext();

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

  useEffect(() => {
    enableScope(CHAT_HOTKEY_SCOPE);
  }, []);

  return null;
};

export default RegisterHotkeys;
