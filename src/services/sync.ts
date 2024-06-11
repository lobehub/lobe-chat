import { dataSync } from '@/database/client/core';
import { StartDataSyncParams, SyncMethod } from '@/types/sync';

class SyncService {
  enabledSync = async (params: StartDataSyncParams) => {
    if (typeof window === 'undefined') return false;

    await dataSync.startDataSync(params);
    return true;
  };

  disableSync = async (params: Record<SyncMethod, boolean>) => {
    if (typeof window === 'undefined') return false;

    if (params.liveblocks) await dataSync.cleanWebrtcConnection();
    if (params.webrtc) await dataSync.cleanLiveblocksConnection();
    return false;
  };
}

export const syncService = new SyncService();
