import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { SessionDefaultGroup, SessionGroupId, SessionGroupItem } from '@/types/session';

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
  sessionCustomGroups: SessionGroupItem[];
  sessionGroupKeys: SessionGroupId[];
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
  isMobile?: boolean;
  latestVersion?: string;
  /**
   *  用户偏好的 UI 状态
   *  @localStorage
   */
  preference: GlobalPreference;
  router?: AppRouterInstance;
  settingsTab: SettingsTabs;
  sidebarKey: SidebarTabKey;
}

export const initialCommonState: GlobalCommonState = {
  isMobile: false,
  preference: {
    guide: {},
    inputHeight: 200,
    mobileShowTopic: false,
    sessionCustomGroups: [],
    sessionGroupKeys: [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default],
    sessionsWidth: 320,
    showChatSideBar: true,
    showSessionPanel: true,
    showSystemRole: false,
    useCmdEnterToSend: false,
  },
  settingsTab: SettingsTabs.Common,
  sidebarKey: SidebarTabKey.Chat,
};
