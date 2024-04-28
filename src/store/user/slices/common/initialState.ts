import { PeerSyncStatus, SyncAwarenessState } from '@/types/sync';

export interface Guide {
  // Topic 引导
  topic?: boolean;
}

export interface UserCommonState {
  syncAwareness: SyncAwarenessState[];
  syncEnabled: boolean;
  syncStatus: PeerSyncStatus;
}

export const initialCommonState: UserCommonState = {
  syncAwareness: [],
  syncEnabled: false,
  syncStatus: PeerSyncStatus.Disabled,
};
