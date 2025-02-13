import { DeepPartial } from 'utility-types';

import { edgeClient } from '@/libs/trpc/client';
import { LobeAgentConfig } from '@/types/agent';
import { GlobalRuntimeConfig } from '@/types/serverConfig';

const VERSION_URL = 'https://registry.npmmirror.com/@lobehub/chat/latest';

class GlobalService {
  /**
   * get latest version from npm
   */
  getLatestVersion = async (): Promise<string> => {
    const res = await fetch(VERSION_URL);
    const data = await res.json();

    return data['version'];
  };

  getGlobalConfig = async (): Promise<GlobalRuntimeConfig> => {
    return edgeClient.config.getGlobalConfig.query();
  };

  getDefaultAgentConfig = async (): Promise<DeepPartial<LobeAgentConfig>> => {
    return edgeClient.config.getDefaultAgentConfig.query();
  };
}

export const globalService = new GlobalService();
