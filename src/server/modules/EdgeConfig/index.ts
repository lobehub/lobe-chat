import { EdgeConfigClient, createClient } from '@vercel/edge-config';

import { appEnv } from '@/envs/app';

import type { EdgeConfigData } from './types';

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
      await this.client.getAll<EdgeConfigData>(['assistant_whitelist', 'assistant_blacklist']);
    return { blacklist, whitelist };
  };
}
