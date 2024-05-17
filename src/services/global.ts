import { DeepPartial } from 'utility-types';

import { dataSync } from '@/database/client/core';
import { edgeClient } from '@/libs/trpc/client';
import { LobeAgentConfig } from '@/types/agent';
import { GlobalServerConfig } from '@/types/serverConfig';
import { StartDataSyncParams } from '@/types/sync';

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
    return edgeClient.config.getGlobalConfig.query();
  };

  getDefaultAgentConfig = async (): Promise<DeepPartial<LobeAgentConfig>> => {
    return edgeClient.config.getDefaultAgentConfig.query();
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
