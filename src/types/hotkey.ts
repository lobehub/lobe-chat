import { KeyMapEnum } from '@lobehub/ui/es/Hotkey';

export const KeyEnum = {
  ...KeyMapEnum,
  Number: '1-9',
} as const;

export const HotkeyEnum = {
  AddUserMessage: 'addUserMessage',
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
