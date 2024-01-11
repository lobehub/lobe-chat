export enum SidebarTabKey {
  Chat = 'chat',
  Market = 'market',
  Setting = 'settings',
}

export enum SettingsTabs {
  Agent = 'agent',
  Common = 'common',
  LLM = 'llm',
  TTS = 'tts',
}

export interface Guide {
  // Topic 引导
  topic?: boolean;
}

export interface GlobalPreference {
  guide?: Guide;
  inputHeight: number;
  mobileShowTopic?: boolean;
  sessionGroupKeys: string[];
  sessionsWidth: number;
  showChatSideBar?: boolean;
  showSessionPanel?: boolean;
  showSystemRole?: boolean;
  /**
   * whether to use cmd + enter to send message
   */
  useCmdEnterToSend?: boolean;
}

export interface GlobalCommonState {
  hasNewVersion?: boolean;
  latestVersion?: string;
  /**
   *  用户偏好的 UI 状态
   *  @localStorage
   */
  preference: GlobalPreference;
  settingsTab: SettingsTabs;
  sidebarKey: SidebarTabKey;
}

export const initialCommonState: GlobalCommonState = {
  preference: {
    guide: {},
    inputHeight: 200,
    mobileShowTopic: false,
    sessionGroupKeys: ['pinned', 'sessionList'],
    sessionsWidth: 320,
    showChatSideBar: true,
    showSessionPanel: true,
    showSystemRole: false,
    useCmdEnterToSend: false,
  },
  settingsTab: SettingsTabs.Common,
  sidebarKey: SidebarTabKey.Chat,
};
