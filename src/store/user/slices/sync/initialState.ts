import { PeerSyncStatus, SyncAwarenessState } from '@/types/sync';

export interface UserSyncState {
  syncAwareness: SyncAwarenessState[];
  syncEnabled: boolean;
  syncStatus: PeerSyncStatus;
}

export const initialSyncState: UserSyncState = {
  syncAwareness: [],
  syncEnabled: false,
  syncStatus: PeerSyncStatus.Disabled,
};
