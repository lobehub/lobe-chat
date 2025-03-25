import { KeyMapEnum as Key, combineKeys } from '@lobehub/ui';

import { HotkeyEnum, HotkeyGroupEnum, HotkeyRegistration } from '@/types/hotkey';

export const ALT_KEY = 'alt';
export const META_KEY = 'mod';
export const SAVE_TOPIC_KEY = 'n';
export const CLEAN_MESSAGE_KEY = 'backspace';

export const HOTKEYS = {
  chatSettings: 'mod+comma',
  regenerate: 'alt+r',
  saveTopic: 'alt+n',
  zenMode: 'mod+\\',
};

// mod 在 Mac 上是 command 键，alt 在 Win 上是 ctrl 键
export const HOTKEYS_REGISTRATION: HotkeyRegistration = [
  {
    group: HotkeyGroupEnum.System,
    id: HotkeyEnum.SearchAgent,
    keys: combineKeys([Key.Mod, 'k']),
  },
  {
    group: HotkeyGroupEnum.System,
    id: 'openSettings',
    keys: combineKeys([Key.Mod, Key.Comma]),
  },
  {
    group: HotkeyGroupEnum.Layout,
    id: HotkeyEnum.SwitchLeftPanel,
    keys: combineKeys([Key.Mod, Key.Alt, Key.Left]),
  },
  {
    group: HotkeyGroupEnum.Layout,
    id: HotkeyEnum.SwitchRightPanel,
    keys: combineKeys([Key.Mod, Key.Alt, Key.Right]),
  },
  {
    group: HotkeyGroupEnum.Layout,
    id: HotkeyEnum.SwitchZenMode,
    keys: combineKeys([Key.Mod, Key.Backslash]),
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
    id: HotkeyEnum.EditMessage,
    keys: combineKeys([Key.Alt, Key.LeftDoubleClick]),
    nonEditable: true,
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.SwitchAgent,
    keys: combineKeys([Key.Ctrl, '0-9']),
    nonEditable: true,
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.AddUserMessage,
    keys: combineKeys([Key.Alt, Key.Enter]),
  },
];
