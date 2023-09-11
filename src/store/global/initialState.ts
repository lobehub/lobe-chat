import { DEFAULT_SETTINGS } from '@/const/settings';
import type { GlobalSettings } from '@/types/settings';

export type SidebarTabKey = 'chat' | 'market' | 'settings';

export type SettingsTabs = 'agent' | 'common' | 'llm';

export interface Guide {
  // Topic 引导
  topic?: boolean;
}

export interface GlobalState {
  /**
   *  用户偏好的 UI 状态
   *  @localStorage
   */
  preference: GlobalPreference;
  /**
   * @localStorage
   * 用户设置
   */
  settings: GlobalSettings;
  settingsTab?: SettingsTabs;
  sidebarKey: SidebarTabKey;
}

export interface GlobalPreference {
  guide?: Guide;
  inputHeight: number;
  mobileShowTopic?: boolean;
  sessionsWidth: number;
  showChatSideBar?: boolean;
  showSessionPanel?: boolean;
}

export const initialState: GlobalState = {
  preference: {
    guide: {},
    inputHeight: 200,
    mobileShowTopic: false,
    sessionsWidth: 320,
    showChatSideBar: true,
    showSessionPanel: true,
  },
  settings: DEFAULT_SETTINGS,
  sidebarKey: 'chat',
};
