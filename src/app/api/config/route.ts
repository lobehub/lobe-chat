import { getServerConfig } from '@/config/server';
import { GlobalServerConfig } from '@/types/settings';

import { parseAgentConfig } from './parseDefaultAgent';

export const runtime = 'edge';

/**
 * get Server config to client
 */
export const GET = async () => {
  const {
    ENABLE_LANGFUSE,
    CUSTOM_MODELS,
    ENABLED_MOONSHOT,
    ENABLED_ZHIPU,
    ENABLED_AWS_BEDROCK,
    ENABLED_GOOGLE,
    ENABLED_GROQ,
    ENABLE_OAUTH_SSO,
    ENABLE_OLLAMA,
    ENABLED_PERPLEXITY,
    ENABLED_ANTHROPIC,
    ENABLED_MISTRAL,
    ENABLED_OPENROUTER,
    DEFAULT_AGENT_CONFIG,
    OLLAMA_CUSTOM_MODELS,
  } = getServerConfig();

  const config: GlobalServerConfig = {
    customModelName: CUSTOM_MODELS,
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },

    enabledOAuthSSO: ENABLE_OAUTH_SSO,
    languageModel: {
      anthropic: { enabled: ENABLED_ANTHROPIC },
      bedrock: { enabled: ENABLED_AWS_BEDROCK },
      google: { enabled: ENABLED_GOOGLE },
      groq: { enabled: ENABLED_GROQ },
      mistral: { enabled: ENABLED_MISTRAL },
      moonshot: { enabled: ENABLED_MOONSHOT },
      ollama: { customModelName: OLLAMA_CUSTOM_MODELS, enabled: ENABLE_OLLAMA },
      openrouter: { enabled: ENABLED_OPENROUTER },
      perplexity: { enabled: ENABLED_PERPLEXITY },
      zhipu: { enabled: ENABLED_ZHIPU },
    },
    telemetry: {
      langfuse: ENABLE_LANGFUSE,
    },
  };

  return new Response(JSON.stringify(config));
};
