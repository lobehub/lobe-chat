import type { ThemeMode } from 'antd-style';

import type { ConfigSettings } from '@/types/exportConfig';

export type SidebarTabKey = 'chat' | 'market';
export const DEFAULT_SETTINGS: ConfigSettings = {
  avatar: '',
};

export interface SettingsState {
  inputHeight: number;
  sessionExpandable?: boolean;
  sessionsWidth: number;
  settings: ConfigSettings;
  sidebarKey: SidebarTabKey;
  themeMode?: ThemeMode;
}

export const initialState: SettingsState = {
  inputHeight: 200,
  sessionExpandable: true,
  sessionsWidth: 320,
  settings: DEFAULT_SETTINGS,
  sidebarKey: 'chat',
};
