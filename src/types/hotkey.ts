export const HotkeyEnum = {
  openSettings: 'openSettings',
  regenerateMessage: 'regenerateMessage',
  saveTopic: 'saveTopic',
  switchZenMode: 'switchZenMode',
} as const;

export interface HotkeyItem {
  id: keyof typeof HotkeyEnum;
  isDesktop: boolean;
  keys: string;
}

export type HotkeyRegistration = HotkeyItem[];

export type HotkeyI18nTranslations = Record<
  keyof typeof HotkeyEnum,
  {
    desc?: string;
    title: string;
  }
>;
