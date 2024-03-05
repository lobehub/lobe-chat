import { getServerConfig } from '@/config/server';
import { GlobalServerConfig } from '@/types/settings';

import { parseAgentConfig } from './parseDefaultAgent';

export const runtime = 'edge';

/**
 * get Server config to client
 */
export const GET = async () => {
  const {
    CUSTOM_MODELS,
    ENABLED_MOONSHOT,
    ENABLED_ZHIPU,
    ENABLED_AWS_BEDROCK,
    ENABLED_GOOGLE,
    ENABLE_OAUTH_SSO,
    ENABLE_OLLAMA,
    ENABLED_PERPLEXITY,
    DEFAULT_AGENT_CONFIG,
    ENABLE_LANGFUSE,
  } = getServerConfig();

  const config: GlobalServerConfig = {
    customModelName: CUSTOM_MODELS,
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },

    enabledOAuthSSO: ENABLE_OAUTH_SSO,
    languageModel: {
      bedrock: { enabled: ENABLED_AWS_BEDROCK },
      google: { enabled: ENABLED_GOOGLE },
      moonshot: { enabled: ENABLED_MOONSHOT },
      ollama: { enabled: ENABLE_OLLAMA },
      perplexity: { enabled: ENABLED_PERPLEXITY },
      zhipu: { enabled: ENABLED_ZHIPU },
    },
    telemetry: {
      langfuse: ENABLE_LANGFUSE,
    },
  };

  return new Response(JSON.stringify(config));
};
