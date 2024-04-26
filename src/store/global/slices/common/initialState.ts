import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { FEATURE_FLAGS } from '@/const/featureFlags';
import { PeerSyncStatus, SyncAwarenessState } from '@/types/sync';

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

export interface Guide {
  // Topic 引导
  topic?: boolean;
}

export interface GlobalCommonState {
  featureFlags: typeof FEATURE_FLAGS;
  hasNewVersion?: boolean;
  isMobile?: boolean;
  latestVersion?: string;
  router?: AppRouterInstance;
  sidebarKey: SidebarTabKey;
  syncAwareness: SyncAwarenessState[];
  syncEnabled: boolean;
  syncStatus: PeerSyncStatus;
}

export const initialCommonState: GlobalCommonState = {
  featureFlags: FEATURE_FLAGS,
  isMobile: false,
  sidebarKey: SidebarTabKey.Chat,
  syncAwareness: [],
  syncEnabled: false,
  syncStatus: PeerSyncStatus.Disabled,
};
