import { PeerSyncStatus, SyncAwarenessState, SyncMethod } from '@/types/sync';

export type UserSyncState = {
  [K in SyncMethod]: {
    awareness: SyncAwarenessState[];
    enabled: boolean;
    status: PeerSyncStatus;
  };
};

export const initialSyncState: UserSyncState = {
  liveblocks: {
    awareness: [],
    enabled: false,
    status: PeerSyncStatus.Disabled,
  },
  webrtc: {
    awareness: [],
    enabled: false,
    status: PeerSyncStatus.Disabled,
  },
};
