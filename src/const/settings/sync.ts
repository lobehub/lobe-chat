import { UserSyncSettings } from '@/types/user/settings';

export const DEFAULT_SYNC_CONFIG: UserSyncSettings = {
  liveblocks: { enabled: false },
  webrtc: { enabled: false },
};
