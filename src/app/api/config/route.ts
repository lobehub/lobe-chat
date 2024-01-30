import { getServerConfig } from '@/config/server';
import { GlobalServerConfig } from '@/types/settings';

export const runtime = 'edge';

/**
 * get Server config to client
 */
export const GET = async () => {
  const { CUSTOM_MODELS, ENABLED_ZHIPU } = getServerConfig();

  const config: GlobalServerConfig = {
    customModelName: CUSTOM_MODELS,
    languageModel: { zhipu: { enabled: ENABLED_ZHIPU } },
  };

  return new Response(JSON.stringify(config));
};
