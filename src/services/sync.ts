import { liveblocksDataSync, webrtcDataSync } from '@/database/client/core';
import { StartDataSyncParams, SyncMethod } from '@/types/sync';

class SyncService {
  enabledSync = async (params: StartDataSyncParams) => {
    if (typeof window === 'undefined') return false;

    const user = params.user;
    const { liveblocks, webrtc } = params.channel;

    if (webrtc.enabled) await webrtcDataSync.startDataSync(user, webrtc);
    if (liveblocks.enabled) await liveblocksDataSync.startDataSync(user, liveblocks);
    return true;
  };

  disableSync = async (params: Record<SyncMethod, boolean>) => {
    if (typeof window === 'undefined') return false;

    if (!params.webrtc) await webrtcDataSync.disconnect();
    if (!params.liveblocks) await liveblocksDataSync.disconnect();

    return false;
  };
}

export const syncService = new SyncService();
