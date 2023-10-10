import { DEFAULT_SETTINGS } from '@/const/settings';
import type { GlobalSettings } from '@/types/settings';

export enum SidebarTabKey {
  Chat = 'chat',
  Market = 'market',
  Setting = 'settings',
}

export enum SettingsTabs {
  Agent = 'agent',
  Common = 'common',
  LLM = 'llm',
}

export interface Guide {
  // Topic 引导
  topic?: boolean;
}

export interface GlobalPreference {
  guide?: Guide;
  inputHeight: number;
  mobileShowTopic?: boolean;
  sessionsWidth: number;
  showChatSideBar?: boolean;
  showSessionPanel?: boolean;
}

export interface GlobalState {
  hasNewVersion?: boolean;
  latestVersion?: string;
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
  settingsTab: SettingsTabs;
  sidebarKey: SidebarTabKey;
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
  settingsTab: SettingsTabs.Common,
  sidebarKey: SidebarTabKey.Chat,
};
