import {
  DesktopHotkeyEnum,
  DesktopHotkeyItem,
  HotkeyEnum,
  HotkeyGroupEnum,
  HotkeyItem,
  HotkeyScopeEnum,
  KeyEnum,
} from '@lobechat/types';

const combineKeys = (keys: string[]) => keys.join('+');

export type HotkeyRegistration = HotkeyItem[];

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
    id: HotkeyEnum.NavigateToChat,
    keys: combineKeys([KeyEnum.Ctrl, KeyEnum.Backquote]),
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
    scopes: [HotkeyScopeEnum.Chat, HotkeyScopeEnum.Files, HotkeyScopeEnum.Image],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.ToggleRightPanel,
    keys: combineKeys([KeyEnum.Mod, KeyEnum.BracketRight]),
    scopes: [HotkeyScopeEnum.Chat, HotkeyScopeEnum.Image],
  },
  {
    group: HotkeyGroupEnum.Essential,
    id: HotkeyEnum.OpenHotkeyHelper,
    keys: combineKeys([KeyEnum.Ctrl, KeyEnum.Shift, KeyEnum.QuestionMark]),
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
  {
    group: HotkeyGroupEnum.Conversation,
    id: HotkeyEnum.ClearCurrentMessages,
    keys: combineKeys([KeyEnum.Alt, KeyEnum.Shift, KeyEnum.Backspace]),
    scopes: [HotkeyScopeEnum.Chat],
  },
];

type DesktopHotkeyRegistration = DesktopHotkeyItem[];

// 桌面端快捷键配置
export const DESKTOP_HOTKEYS_REGISTRATION: DesktopHotkeyRegistration = [
  {
    id: DesktopHotkeyEnum.ShowApp,
    keys: combineKeys([KeyEnum.Ctrl, 'e']),
  },
  {
    id: DesktopHotkeyEnum.OpenSettings,
    keys: combineKeys([KeyEnum.Mod, KeyEnum.Comma]),
    nonEditable: true,
  },
];
