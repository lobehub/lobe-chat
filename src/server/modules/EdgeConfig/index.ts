import { EdgeConfigClient, createClient } from '@vercel/edge-config';
import createDebug from 'debug';

import { appEnv } from '@/envs/app';

const debug = createDebug('lobe-server:edge-config');

const EdgeConfigKeys = {
  /**
   * Assistant whitelist
   */
  AssistantBlacklist: 'assistant_blacklist',
  /**
   * Assistant whitelist
   */
  AssistantWhitelist: 'assistant_whitelist',
  /**
   * Feature flags configuration
   */
  FeatureFlags: 'feature_flags',
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
    const isEnabled = !!appEnv.VERCEL_EDGE_CONFIG;
    debug('VERCEL_EDGE_CONFIG env var: %s', appEnv.VERCEL_EDGE_CONFIG ? 'SET' : 'NOT SET');
    debug('EdgeConfig enabled: %s', isEnabled);
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
    debug('Feature flags retrieved: %O', featureFlags);
    return featureFlags as Record<string, boolean | string[]> | undefined;
  };
}

export { EdgeConfigKeys };
