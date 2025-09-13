import { getServerFeatureFlagsStateFromEdgeConfig } from '@/config/featureFlags';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { getServerDefaultAgentConfig, getServerGlobalConfig } from '@/server/globalConfig';
import { GlobalRuntimeConfig } from '@/types/serverConfig';

export const configRouter = router({
  getDefaultAgentConfig: publicProcedure.query(async () => {
    return getServerDefaultAgentConfig();
  }),

  getGlobalConfig: publicProcedure.query(async ({ ctx }): Promise<GlobalRuntimeConfig> => {
    console.log(
      '[GlobalConfig] Starting global config retrieval for user:',
      ctx.userId || 'anonymous',
    );

    const serverConfig = await getServerGlobalConfig();
    console.log('[GlobalConfig] Server config retrieved');

    const serverFeatureFlags = await getServerFeatureFlagsStateFromEdgeConfig(
      ctx.userId || undefined,
    );
    console.log(
      '[GlobalConfig] Final feature flags to return (evaluated booleans only):',
      serverFeatureFlags,
    );

    const result = { serverConfig, serverFeatureFlags };
    console.log(
      '[GlobalConfig] Returning global config with feature flags keys:',
      Object.keys(serverFeatureFlags),
    );

    return result;
  }),
});
