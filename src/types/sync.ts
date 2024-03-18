import { LobeDBSchemaMap } from '@/database/core/db';

export type OnSyncEvent = (tableKey: keyof LobeDBSchemaMap) => void;
export type OnSyncStatusChange = (status: PeerSyncStatus) => void;
export type OnAwarenessChange = (state: SyncAwarenessState[]) => void;

export type PeerSyncStatus = 'syncing' | 'synced' | 'ready';

export interface StartDataSyncParams {
  channel: {
    name: string;
    password?: string;
  };
  onAwarenessChange: OnAwarenessChange;
  onSyncEvent: OnSyncEvent;
  onSyncStatusChange: OnSyncStatusChange;
  signaling?: string;
  user: SyncUserInfo;
}

export interface SyncUserInfo {
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
