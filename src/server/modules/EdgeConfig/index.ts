import { EdgeConfigClient, createClient } from '@vercel/edge-config';

import { appEnv } from '@/config/app';

const EdgeConfigKeys = {
  /**
   * Assistant whitelist
   */
  AssistantBlacklist: 'assistant_blacklist',
  /**
   * Assistant whitelist
   */
  AssistantWhitelist: 'assistant_whitelist',
};

export class EdgeConfig {
  get client(): EdgeConfigClient {
    if (!appEnv.VERCEL_EDGE_CONFIG) {
      throw new Error('VERCEL_EDGE_CONFIG is not set');
    }
    return createClient(appEnv.VERCEL_EDGE_CONFIG);
  }

  /**
   * Check if Edge Config is enabled
   */
  static isEnabled() {
    return !!appEnv.VERCEL_EDGE_CONFIG;
  }

  getAgentRestrictions = async () => {
    const { assistant_blacklist: blacklist, assistant_whitelist: whitelist } =
      await this.client.getAll([
        EdgeConfigKeys.AssistantWhitelist,
        EdgeConfigKeys.AssistantBlacklist,
      ]);

    return { blacklist, whitelist } as {
      blacklist: string[] | undefined;
      whitelist: string[] | undefined;
    };
  };
}
