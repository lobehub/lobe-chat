import { EdgeConfig } from '@lobechat/edge-config';
import debug from 'debug';

import { getServerFeatureFlagsStateFromEdgeConfig } from '@/config/featureFlags';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { getServerDefaultAgentConfig, getServerGlobalConfig } from '@/server/globalConfig';
import { type GlobalRuntimeConfig } from '@/types/serverConfig';

const log = debug('config-router');

export const configRouter = router({
  getDefaultAgentConfig: publicProcedure.query(async () => {
    return getServerDefaultAgentConfig();
  }),

  getGlobalConfig: publicProcedure.query(async ({ ctx }): Promise<GlobalRuntimeConfig> => {
    log('[GlobalConfig] Starting global config retrieval for user:', ctx.userId || 'anonymous');

    const [serverConfig, serverFeatureFlags] = await Promise.all([
      getServerGlobalConfig(),
      getServerFeatureFlagsStateFromEdgeConfig(ctx.userId || undefined),
    ]);

    log('[GlobalConfig] Server config retrieved');
    log(
      '[GlobalConfig] Final feature flags to return (evaluated booleans only):',
      serverFeatureFlags,
    );

    const result = { serverConfig, serverFeatureFlags };
    log(
      '[GlobalConfig] Returning global config with feature flags keys:',
      Object.keys(serverFeatureFlags),
    );

    return result;
  }),

  /**
   * Get user whitelist from EdgeConfig
   */
  getWhitelist: publicProcedure.query(async () => {
    if (!EdgeConfig.isEnabled()) {
      log('[Whitelist] EdgeConfig not enabled, returning empty whitelist');
      return [];
    }

    try {
      const edgeConfig = new EdgeConfig();
      const whitelist = await edgeConfig.getWhitelist();
      log('[Whitelist] Retrieved whitelist with %d entries', whitelist?.length ?? 0);
      return whitelist ?? [];
    } catch (error) {
      log('[Whitelist] Failed to fetch whitelist:', error);
      return [];
    }
  }),
});
