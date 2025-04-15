import {
  HotkeyEnum,
  HotkeyGroupEnum,
  HotkeyRegistration,
  HotkeyScopeEnum,
  KeyEnum,
} from '@/types/hotkey';

const combineKeys = (keys: string[]) => keys.join('+');

// mod 在 Mac 上是 command 键，alt 在 Win 上是 ctrl 键
export const HOTKEYS_REGISTRATION: HotkeyRegistration = [
  // basic
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.Search,
    keys: combineKeys([KeyEnum.Mod, 'k']),
    scopes: [HotkeyScopeEnum.Global],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.SwitchAgent,
    keys: combineKeys([KeyEnum.Ctrl, KeyEnum.Number]),
    nonEditable: true,
    scopes: [HotkeyScopeEnum.Global],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.ToggleZenMode,
    keys: combineKeys([KeyEnum.Mod, KeyEnum.Backslash]),
    scopes: [HotkeyScopeEnum.Chat],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.ToggleLeftPanel,
    keys: combineKeys([KeyEnum.Mod, KeyEnum.BracketLeft]),
    scopes: [HotkeyScopeEnum.Chat],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.ToggleRightPanel,
    keys: combineKeys([KeyEnum.Mod, KeyEnum.BracketRight]),
    scopes: [HotkeyScopeEnum.Chat],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.OpenHotkeyHelper,
    keys: combineKeys([KeyEnum.Ctrl, KeyEnum.Shift, KeyEnum.QuestionMark]),
    scopes: [HotkeyScopeEnum.Global],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.OpenSettings,
    isDesktop: true,
    keys: combineKeys([KeyEnum.Mod, KeyEnum.Comma]),
    nonEditable: true,
    scopes: [HotkeyScopeEnum.Global],
  },
  // Chat
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.OpenChatSettings,
    keys: combineKeys([KeyEnum.Alt, KeyEnum.Comma]),
    scopes: [HotkeyScopeEnum.Chat],
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.RegenerateMessage,
    keys: combineKeys([KeyEnum.Alt, 'r']),
    scopes: [HotkeyScopeEnum.Chat],
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.SaveTopic,
    keys: combineKeys([KeyEnum.Alt, 'n']),
    scopes: [HotkeyScopeEnum.Chat],
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.AddUserMessage,
    keys: combineKeys([KeyEnum.Alt, KeyEnum.Enter]),
    // 不通过 Scope 模式激活
  },
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.EditMessage,
    keys: combineKeys([KeyEnum.Alt, KeyEnum.LeftDoubleClick]),
    nonEditable: true,
    scopes: [HotkeyScopeEnum.Chat],
  },
];
