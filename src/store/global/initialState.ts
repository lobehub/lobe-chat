import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { SessionDefaultGroup } from '@/types/session';
import { AsyncLocalStorage } from '@/utils/localStorage';

export enum SidebarTabKey {
  Chat = 'chat',
  Market = 'market',
  Setting = 'settings',
}

export enum SettingsTabs {
  About = 'about',
  Agent = 'agent',
  Common = 'common',
  LLM = 'llm',
  Sync = 'sync',
  TTS = 'tts',
}

export interface GlobalPreference {
  // which sessionGroup should expand
  expandSessionGroupKeys: string[];
  inputHeight: number;
  mobileShowTopic?: boolean;
  sessionsWidth: number;
  showChatSideBar?: boolean;
  showSessionPanel?: boolean;
  showSystemRole?: boolean;
}

export interface GlobalPreferenceState {
  /**
   * the user preference, which only store in local storage
   */
  preference: GlobalPreference;
  preferenceStorage: AsyncLocalStorage<GlobalPreference>;
}

export interface GlobalCommonState {
  hasNewVersion?: boolean;
  isMobile?: boolean;
  latestVersion?: string;
  router?: AppRouterInstance;
  sidebarKey: SidebarTabKey;
}

export type GlobalState = GlobalCommonState & GlobalPreferenceState;

export const initialState: GlobalState = {
  isMobile: false,
  preference: {
    expandSessionGroupKeys: [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default],
    inputHeight: 200,
    mobileShowTopic: false,
    sessionsWidth: 320,
    showChatSideBar: true,
    showSessionPanel: true,
    showSystemRole: false,
  },
  preferenceStorage: new AsyncLocalStorage('LOBE_GLOBAL_PREFERENCE'),
  sidebarKey: SidebarTabKey.Chat,
};
