import type { ConfigSettings } from '@/types/exportConfig';

export type SidebarTabKey = 'chat' | 'market';
export const DEFAULT_SETTINGS: ConfigSettings = {
  avatar: '',
  fontSize: 14,
  language: 'zh-CN',
  neutralColor: '',
  primaryColor: '',
  themeMode: 'auto',
};

export interface GlobalSettingsState {
  inputHeight: number;
  sessionExpandable?: boolean;
  sessionsWidth: number;
  settings: ConfigSettings;
  sidebarKey: SidebarTabKey;
}

export const initialState: GlobalSettingsState = {
  inputHeight: 200,
  sessionExpandable: true,
  sessionsWidth: 320,
  settings: DEFAULT_SETTINGS,
  sidebarKey: 'chat',
};
