import {
  OllamaProviderCard,
  OpenRouterProviderCard,
  TogetherAIProviderCard,
} from '@/config/modelProviders';
import { getServerConfig } from '@/config/server';
import { GlobalServerConfig } from '@/types/settings';
import { transformToChatModelCards } from '@/utils/parseModels';

import { parseAgentConfig } from './parseDefaultAgent';

export const runtime = 'edge';

/**
 * get Server config to client
 */
export const GET = async () => {
  const {
    ENABLE_LANGFUSE,
    ENABLE_OAUTH_SSO,

    DEFAULT_AGENT_CONFIG,
    OPENAI_MODEL_LIST,

    ENABLED_MOONSHOT,
    ENABLED_ZHIPU,
    ENABLED_AWS_BEDROCK,
    ENABLED_GOOGLE,
    ENABLED_GROQ,
    ENABLED_PERPLEXITY,
    ENABLED_ANTHROPIC,
    ENABLED_MISTRAL,

    ENABLE_OLLAMA,
    OLLAMA_MODEL_LIST,

    ENABLED_OPENROUTER,
    OPENROUTER_MODEL_LIST,

    ENABLED_ZEROONE,
    ENABLED_TOGETHERAI,
    TOGETHERAI_MODEL_LIST,
  } = getServerConfig();

  const config: GlobalServerConfig = {
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

      ollama: {
        enabled: ENABLE_OLLAMA,
        serverModelCards: transformToChatModelCards(
          OLLAMA_MODEL_LIST,
          OllamaProviderCard.chatModels,
        ),
      },
      openai: {
        serverModelCards: transformToChatModelCards(OPENAI_MODEL_LIST),
      },
      openrouter: {
        enabled: ENABLED_OPENROUTER,
        serverModelCards: transformToChatModelCards(
          OPENROUTER_MODEL_LIST,
          OpenRouterProviderCard.chatModels,
        ),
      },
      perplexity: { enabled: ENABLED_PERPLEXITY },

      togetherai: {
        enabled: ENABLED_TOGETHERAI,
        serverModelCards: transformToChatModelCards(
          TOGETHERAI_MODEL_LIST,
          TogetherAIProviderCard.chatModels,
        ),
      },

      zeroone: { enabled: ENABLED_ZEROONE },
      zhipu: { enabled: ENABLED_ZHIPU },
    },
    telemetry: {
      langfuse: ENABLE_LANGFUSE,
    },
  };

  return new Response(JSON.stringify(config));
};
