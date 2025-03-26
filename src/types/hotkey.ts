export const HotkeyEnum = {
  AddUserMessage: 'addUserMessage',
  EditMessage: 'editMessage',
  OpenChatSettings: 'openChatSettings',
  OpenHotkeyHelper: 'openHotkeyHelper',
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

export type HotkeyId = (typeof HotkeyEnum)[keyof typeof HotkeyEnum];
export type HotkeyGroupId = (typeof HotkeyGroupEnum)[keyof typeof HotkeyGroupEnum];

export interface HotkeyItem {
  group: HotkeyGroupId;
  id: HotkeyId;
  isDesktop?: boolean; // 是否是桌面端专用的快捷键
  keys: string;
  nonEditable?: boolean; // 是否为不可编辑的快捷键
}

export type HotkeyRegistration = HotkeyItem[];

export type HotkeyI18nTranslations = Record<
  HotkeyId,
  {
    desc?: string;
    title: string;
  }
>;
