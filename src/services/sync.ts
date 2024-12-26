import { dataSync } from '@/database/_deprecated/core';
import { StartDataSyncParams } from '@/types/sync';

class SyncService {
  enabledSync = async (params: StartDataSyncParams) => {
    if (typeof window === 'undefined') return false;

    await dataSync.startDataSync(params);
    return true;
  };

  disableSync = async () => {
    await dataSync.disconnect();

    return false;
  };
}

export const syncService = new SyncService();
