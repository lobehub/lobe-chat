import { EdgeConfigClient, createClient } from '@vercel/edge-config';

import { appEnv } from '@/config/app';

enum EdgeConfigKeys {
  /**
   * Assistant whitelist
   */
  AssistantWhitelist = 'assistant_whitelist',
}

export class EdgeConfig {
  get client(): EdgeConfigClient {
    if (!appEnv.VERCEL_EDGE_CONFIG) {
      throw new Error('VERCEL_EDGE_CONFIG is not set');
    }
    return createClient(appEnv.VERCEL_EDGE_CONFIG);
  }

  getAgentWhitelist = async (): Promise<string[] | undefined> => {
    return this.client.get<string[]>(EdgeConfigKeys.AssistantWhitelist);
  };
}
