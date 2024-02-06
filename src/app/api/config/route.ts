import { getServerConfig } from '@/config/server';
import { GlobalServerConfig } from '@/types/settings';

export const runtime = 'edge';

/**
 * get Server config to client
 */
export const GET = async () => {
  const { CUSTOM_MODELS, ENABLED_MOONSHOT, ENABLED_ZHIPU, ENABLED_AWS_BEDROCK, ENABLED_GOOGLE } =
    getServerConfig();

  const config: GlobalServerConfig = {
    customModelName: CUSTOM_MODELS,
    languageModel: {
      bedrock: { enabled: ENABLED_AWS_BEDROCK },
      google: { enabled: ENABLED_GOOGLE },
      moonshot: { enabled: ENABLED_MOONSHOT },
      zhipu: { enabled: ENABLED_ZHIPU },
    },
  };

  return new Response(JSON.stringify(config));
};
