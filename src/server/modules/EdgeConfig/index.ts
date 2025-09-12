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
    const isEnabled = !!appEnv.VERCEL_EDGE_CONFIG;
    console.log(
      '[EdgeConfig] VERCEL_EDGE_CONFIG env var:',
      appEnv.VERCEL_EDGE_CONFIG ? 'SET' : 'NOT SET',
    );
    console.log('[EdgeConfig] EdgeConfig enabled:', isEnabled);
    return isEnabled;
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

  getFlagByKey = async (key: string) => {
    const value = await this.client.get(key);
    return value;
  };

  getFeatureFlags = async () => {
    const featureFlags = await this.client.get(EdgeConfigKeys.FeatureFlags);
    console.log('[EdgeConfig] Feature flags retrieved:', featureFlags);
    return featureFlags as Record<string, boolean | string[]> | undefined;
  };
}

export { EdgeConfigKeys };
