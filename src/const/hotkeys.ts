import { KeyMapEnum as Key, combineKeys } from '@lobehub/ui/es/Hotkey';

import { HotkeyEnum, HotkeyGroupEnum, HotkeyRegistration } from '@/types/hotkey';

// 默认全局注册的快捷键 scope
// https://react-hotkeys-hook.vercel.app/docs/documentation/hotkeys-provider
export const GLOBAL_HOTKEY_SCOPE = 'global';
export const CHAT_HOTKEY_SCOPE = 'chat';

export const KEY_NUMBER = '1-9';

// mod 在 Mac 上是 command 键，alt 在 Win 上是 ctrl 键
export const HOTKEYS_REGISTRATION: HotkeyRegistration = [
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.Search,
    keys: combineKeys([Key.Mod, 'k']),
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.SwitchAgent,
    keys: combineKeys([Key.Ctrl, KEY_NUMBER]),
    nonEditable: true,
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.ToggleLeftPanel,
    keys: combineKeys([Key.Mod, Key.Alt, Key.Left]),
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.ToggleRightPanel,
    keys: combineKeys([Key.Mod, Key.Alt, Key.Right]),
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.ToggleZenMode,
    keys: combineKeys([Key.Mod, Key.Backslash]),
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.OpenHotkeyHelper,
    keys: combineKeys([Key.Ctrl, Key.Shift, '?']),
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.OpenChatSettings,
    keys: combineKeys([Key.Mod, Key.Alt, 's']),
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.RegenerateMessage,
    keys: combineKeys([Key.Alt, 'r']),
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.SaveTopic,
    keys: combineKeys([Key.Alt, 'n']),
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.AddUserMessage,
    keys: combineKeys([Key.Alt, Key.Enter]),
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.EditMessage,
    keys: combineKeys([Key.Alt, Key.LeftDoubleClick]),
    nonEditable: true,
  },
];
