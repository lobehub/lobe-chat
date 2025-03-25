export const HotkeyEnum = {
  AddUserMessage: 'addUserMessage',
  EditMessage: 'editMessage',
  OpenSettings: 'openSettings',
  RegenerateMessage: 'regenerateMessage',
  SaveTopic: 'saveTopic',
  SearchAgent: 'searchAgent',
  SwitchAgent: 'switchAgent',
  SwitchLeftPanel: 'switchLeftPanel',
  SwitchRightPanel: 'switchRightPanel',
  SwitchZenMode: 'switchZenMode',
} as const;

export const HotkeyGroupEnum = {
  Conversation: 'conversation',
  Layout: 'layout',
  System: 'system',
} as const;

export interface HotkeyItem {
  group: (typeof HotkeyGroupEnum)[keyof typeof HotkeyGroupEnum];
  id: (typeof HotkeyEnum)[keyof typeof HotkeyEnum];
  isDesktop?: boolean; // 是否是桌面端专用的快捷键
  keys: string;
  nonEditable?: boolean; // 是否为不可编辑的快捷键
}

export type HotkeyRegistration = HotkeyItem[];

export type HotkeyI18nTranslations = Record<
  (typeof HotkeyEnum)[keyof typeof HotkeyEnum],
  {
    desc?: string;
    title: string;
  }
>;
