import {
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  TogetherAIProviderCard,
} from '@/config/modelProviders';
import { getServerConfig } from '@/config/server';
import { publicProcedure, router } from '@/libs/trpc';
import { parseAgentConfig } from '@/server/routers/config/parseDefaultAgent';
import { GlobalServerConfig } from '@/types/serverConfig';
import { extractEnabledModels, transformToChatModelCards } from '@/utils/parseModels';

export const configRouter = router({
  getDefaultAgentConfig: publicProcedure.query(async () => {
    const { DEFAULT_AGENT_CONFIG } = getServerConfig();

    return parseAgentConfig(DEFAULT_AGENT_CONFIG) || {};
  }),

  getGlobalConfig: publicProcedure.query(async () => {
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

      ENABLED_AZURE_OPENAI,
      AZURE_MODEL_LIST,

      ENABLE_OLLAMA,
      OLLAMA_MODEL_LIST,
      OLLAMA_PROXY_URL,

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
        anthropic: {
          enabled: ENABLED_ANTHROPIC,
        },
        azure: {
          enabled: ENABLED_AZURE_OPENAI,
          enabledModels: extractEnabledModels(AZURE_MODEL_LIST, true),
          serverModelCards: transformToChatModelCards({
            defaultChatModels: [],
            modelString: AZURE_MODEL_LIST,
            withDeploymentName: true,
          }),
        },
        bedrock: { enabled: ENABLED_AWS_BEDROCK },
        google: { enabled: ENABLED_GOOGLE },
        groq: { enabled: ENABLED_GROQ },
        mistral: { enabled: ENABLED_MISTRAL },
        moonshot: { enabled: ENABLED_MOONSHOT },
        ollama: {
          enabled: ENABLE_OLLAMA,
          fetchOnClient: !OLLAMA_PROXY_URL,
          serverModelCards: transformToChatModelCards({
            defaultChatModels: OllamaProviderCard.chatModels,
            modelString: OLLAMA_MODEL_LIST,
          }),
        },
        openai: {
          enabledModels: extractEnabledModels(OPENAI_MODEL_LIST),
          serverModelCards: transformToChatModelCards({
            defaultChatModels: OpenAIProviderCard.chatModels,
            modelString: OPENAI_MODEL_LIST,
          }),
        },

        openrouter: {
          enabled: ENABLED_OPENROUTER,
          enabledModels: extractEnabledModels(OPENROUTER_MODEL_LIST),
          serverModelCards: transformToChatModelCards({
            defaultChatModels: OpenRouterProviderCard.chatModels,
            modelString: OPENROUTER_MODEL_LIST,
          }),
        },
        perplexity: { enabled: ENABLED_PERPLEXITY },

        togetherai: {
          enabled: ENABLED_TOGETHERAI,
          enabledModels: extractEnabledModels(TOGETHERAI_MODEL_LIST),
          serverModelCards: transformToChatModelCards({
            defaultChatModels: TogetherAIProviderCard.chatModels,
            modelString: TOGETHERAI_MODEL_LIST,
          }),
        },

        zeroone: { enabled: ENABLED_ZEROONE },
        zhipu: { enabled: ENABLED_ZHIPU },
      },
      telemetry: {
        langfuse: ENABLE_LANGFUSE,
      },
    };

    return config;
  }),
});
