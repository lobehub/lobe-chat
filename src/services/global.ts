import { dataSync } from '@/database/client/core';
import { GlobalServerConfig } from '@/types/serverConfig';
import { StartDataSyncParams } from '@/types/sync';

import { API_ENDPOINTS } from './_url';

const VERSION_URL = 'https://registry.npmmirror.com/@lobehub/chat';

class GlobalService {
  /**
   * get latest version from npm
   */
  getLatestVersion = async (): Promise<string> => {
    const res = await fetch(VERSION_URL);
    const data = await res.json();

    return data['dist-tags']?.latest;
  };

  getGlobalConfig = async (): Promise<GlobalServerConfig> => {
    const res = await fetch(API_ENDPOINTS.config);

    return res.json();
  };

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

export const globalService = new GlobalService();
