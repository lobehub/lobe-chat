import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';


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

export interface GlobalCommonState {
  hasNewVersion?: boolean;
  isMobile?: boolean;
  latestVersion?: string;
  router?: AppRouterInstance;
  settingsTab: SettingsTabs;
  sidebarKey: SidebarTabKey;
}

export const initialCommonState: GlobalCommonState = {
  isMobile: false,
  settingsTab: SettingsTabs.Common,
  sidebarKey: SidebarTabKey.Chat,
};
