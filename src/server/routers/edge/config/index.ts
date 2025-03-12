import { getServerFeatureFlagsValue } from '@/config/featureFlags';
import { publicProcedure, router } from '@/libs/trpc';
import { getServerDefaultAgentConfig, getServerGlobalConfig } from '@/server/globalConfig';
import { GlobalRuntimeConfig } from '@/types/serverConfig';

export const configRouter = router({
  getDefaultAgentConfig: publicProcedure.query(async () => {
    return getServerDefaultAgentConfig();
  }),

  getGlobalConfig: publicProcedure.query(async (): Promise<GlobalRuntimeConfig> => {
    const serverConfig = await getServerGlobalConfig();
    const serverFeatureFlags = getServerFeatureFlagsValue();

    return { serverConfig, serverFeatureFlags };
  }),
});
