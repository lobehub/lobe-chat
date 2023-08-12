import { DEFAULT_SETTINGS } from '@/const/settings';
import type { GlobalSettings } from '@/types/settings';

export type SidebarTabKey = 'chat' | 'market' | 'settings';

export interface Guide {
  // Topic 引导
  topic?: boolean;
}

export interface AppSettingsState {
  guide?: Guide;
  inputHeight: number;
  sessionExpandable?: boolean;
  sessionsWidth: number;
  settings: GlobalSettings;
  showAgentConfig?: boolean;
  sidebarKey: SidebarTabKey;
}

export const initialState: AppSettingsState = {
  guide: {},
  inputHeight: 200,
  sessionExpandable: true,
  sessionsWidth: 320,
  settings: DEFAULT_SETTINGS,
  showAgentConfig: true,
  sidebarKey: 'chat',
};
