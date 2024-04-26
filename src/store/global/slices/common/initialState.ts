import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { DEFAULT_FEATURE_FLAGS, FeatureFlags } from '@/const/featureFlags';
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
  featureFlags: FeatureFlags;
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
  featureFlags: DEFAULT_FEATURE_FLAGS,
  isMobile: false,
  sidebarKey: SidebarTabKey.Chat,
  syncAwareness: [],
  syncEnabled: false,
  syncStatus: PeerSyncStatus.Disabled,
};
