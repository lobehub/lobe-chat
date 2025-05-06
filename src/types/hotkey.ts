export const KeyEnum = {
  Alt: 'alt',
  Backquote: 'backquote',
  // `
  Backslash: 'backslash',
  // \
  Backspace: 'backspace',
  BracketLeft: 'bracketleft',
  // [
  BracketRight: 'bracketright',
  // ]
  Comma: 'comma',
  // ,
  Ctrl: 'ctrl',
  Down: 'down',
  Enter: 'enter',
  Equal: 'equal',
  // =
  Esc: 'esc',
  Left: 'left',
  LeftClick: 'left-click',
  LeftDoubleClick: 'left-double-click',
  Meta: 'meta',
  // Command on Mac, Win on Win
  MiddleClick: 'middle-click',
  Minus: 'minus',
  // -
  Mod: 'mod',

  Number: '1-9',

  // Command on Mac, Ctrl on Win
  Period: 'period',

  // .
  Plus: 'equal',

  // +
  QuestionMark: 'slash',

  // ?
  Quote: 'quote',
  // '
  Right: 'right',
  RightClick: 'right-click',
  RightDoubleClick: 'right-double-click',

  Semicolon: 'semicolon',
  // ;
  Shift: 'shift',

  Slash: 'slash',
  // /
  Space: 'space',
  Tab: 'tab',
  Up: 'up',
} as const;

export const HotkeyEnum = {
  AddUserMessage: 'addUserMessage',
  ClearCurrentMessages: 'clearCurrentMessages',
  EditMessage: 'editMessage',
  OpenChatSettings: 'openChatSettings',
  OpenHotkeyHelper: 'openHotkeyHelper',
  OpenSettings: 'openSettings',
  RegenerateMessage: 'regenerateMessage',
  SaveTopic: 'saveTopic',
  Search: 'search',
  SwitchAgent: 'switchAgent',
  ToggleLeftPanel: 'toggleLeftPanel',
  ToggleRightPanel: 'toggleRightPanel',
  ToggleZenMode: 'toggleZenMode',
} as const;

export const HotkeyGroupEnum = {
  Conversation: 'conversation',
  Essential: 'essential',
} as const;

export const HotkeyScopeEnum = {
  Chat: 'chat',
  Files: 'files',
  // 默认全局注册的快捷键 scope
  // https://react-hotkeys-hook.vercel.app/docs/documentation/hotkeys-provider
  Global: 'global',
} as const;

export type HotkeyId = (typeof HotkeyEnum)[keyof typeof HotkeyEnum];
export type HotkeyGroupId = (typeof HotkeyGroupEnum)[keyof typeof HotkeyGroupEnum];
export type HotkeyScopeId = (typeof HotkeyScopeEnum)[keyof typeof HotkeyScopeEnum];

export interface HotkeyItem {
  // 快捷键分组用于展示
  group: HotkeyGroupId;
  id: HotkeyId;
  isDesktop?: boolean;
  // 是否是桌面端专用的快捷键
  keys: string;
  // 是否为不可编辑的快捷键
  nonEditable?: boolean;
  // 快捷键作用域
  scopes?: HotkeyScopeId[];
}

export type HotkeyRegistration = HotkeyItem[];

export type HotkeyI18nTranslations = Record<
  HotkeyId,
  {
    desc?: string;
    title: string;
  }
>;
