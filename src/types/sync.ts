import { LobeDBSchemaMap } from '@/database/client/core/db';

export type OnSyncEvent = (tableKey: keyof LobeDBSchemaMap) => void;
export type OnSyncStatusChange = (status: PeerSyncStatus) => void;
export type OnAwarenessChange = (state: SyncAwarenessState[]) => void;

// export type PeerSyncStatus = 'syncing' | 'synced' | 'ready' | 'unconnected';

export enum PeerSyncStatus {
  Connecting = 'connecting',
  Disabled = 'disabled',
  Ready = 'ready',
  Synced = 'synced',
  Syncing = 'syncing',
  Unconnected = 'unconnected',
}

interface CommonSyncParams {
  onAwarenessChange: OnAwarenessChange;
  onSyncEvent: OnSyncEvent;
  onSyncStatusChange: OnSyncStatusChange;
}

export interface LiveblocksSyncParams extends CommonSyncParams {
  accessCode?: string;
  enabled: boolean;
  name: string;
  password?: string;
  publicApiKey?: string;
}

export interface WebRTCSyncParams extends CommonSyncParams {
  enabled: boolean;
  name: string;
  password?: string;
  signaling: string;
}

export interface StartDataSyncParams {
  channel: {
    liveblocks: LiveblocksSyncParams;
    webrtc: WebRTCSyncParams;
  };
  user: SyncUserInfo;
}

export enum SyncMethod {
  Liveblocks = 'liveblocks',
  WebRTC = 'webrtc',
}

export interface SyncUserInfo extends Record<string, string | boolean | undefined | number> {
  browser?: string;
  id: string;
  isMobile: boolean;
  name?: string;
  os?: string;
}

export interface SyncAwarenessState extends SyncUserInfo {
  clientID: number;
  current: boolean;
}
