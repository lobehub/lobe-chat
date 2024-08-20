import { appEnv, getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { langfuseEnv } from '@/config/langfuse';
import { getLLMConfig } from '@/config/llm';
import {
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  SiliconCloudProviderCard,
  TogetherAIProviderCard,
} from '@/config/modelProviders';
import { enableNextAuth } from '@/const/auth';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';
import { GlobalServerConfig } from '@/types/serverConfig';
import { extractEnabledModels, transformToChatModelCards } from '@/utils/parseModels';

import { parseAgentConfig } from './parseDefaultAgent';

export const getServerGlobalConfig = () => {
  const { ACCESS_CODES, DEFAULT_AGENT_CONFIG } = getAppConfig();

  const {
    ENABLED_OPENAI,
    OPENAI_MODEL_LIST,

    ENABLED_MOONSHOT,
    ENABLED_ZHIPU,
    ENABLED_AWS_BEDROCK,
    ENABLED_GOOGLE,
    ENABLED_GROQ,
    ENABLED_DEEPSEEK,
    ENABLED_PERPLEXITY,
    ENABLED_ANTHROPIC,
    ENABLED_MINIMAX,
    ENABLED_MISTRAL,
    ENABLED_NOVITA,
    ENABLED_QWEN,
    ENABLED_STEPFUN,
    ENABLED_BAICHUAN,
    ENABLED_TAICHU,
    ENABLED_AI360,

    ENABLED_SILICONCLOUD,
    SILICONCLOUD_MODEL_LIST,

    ENABLED_AZURE_OPENAI,
    AZURE_MODEL_LIST,

    ENABLED_OLLAMA,
    OLLAMA_MODEL_LIST,
    OLLAMA_PROXY_URL,

    ENABLED_OPENROUTER,
    OPENROUTER_MODEL_LIST,

    ENABLED_ZEROONE,
    ENABLED_TOGETHERAI,
    TOGETHERAI_MODEL_LIST,
  } = getLLMConfig();

  const config: GlobalServerConfig = {
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,
    enabledAccessCode: ACCESS_CODES?.length > 0,
    enabledOAuthSSO: enableNextAuth,
    languageModel: {
      ai360: { enabled: ENABLED_AI360 },
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
      baichuan: { enabled: ENABLED_BAICHUAN },
      bedrock: { enabled: ENABLED_AWS_BEDROCK },
      deepseek: { enabled: ENABLED_DEEPSEEK },
      google: { enabled: ENABLED_GOOGLE },
      groq: { enabled: ENABLED_GROQ },
      minimax: { enabled: ENABLED_MINIMAX },
      mistral: { enabled: ENABLED_MISTRAL },
      moonshot: { enabled: ENABLED_MOONSHOT },
      novita: { enabled: ENABLED_NOVITA },
      ollama: {
        enabled: ENABLED_OLLAMA,
        fetchOnClient: !OLLAMA_PROXY_URL,
        serverModelCards: transformToChatModelCards({
          defaultChatModels: OllamaProviderCard.chatModels,
          modelString: OLLAMA_MODEL_LIST,
        }),
      },
      openai: {
        enabled: ENABLED_OPENAI,
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
      qwen: { enabled: ENABLED_QWEN },
      siliconcloud: {
        enabled: ENABLED_SILICONCLOUD,
        enabledModels: extractEnabledModels(SILICONCLOUD_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: SiliconCloudProviderCard.chatModels,
          modelString: SILICONCLOUD_MODEL_LIST,
        }),
      },
      stepfun: { enabled: ENABLED_STEPFUN },

      taichu: { enabled: ENABLED_TAICHU },
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
    oAuthSSOProviders: authEnv.NEXT_AUTH_SSO_PROVIDERS.trim().split(/[,，]/),
    systemAgent: parseSystemAgent(appEnv.SYSTEM_AGENT),
    telemetry: {
      langfuse: langfuseEnv.ENABLE_LANGFUSE,
    },
  };

  return config;
};

export const getServerDefaultAgentConfig = () => {
  const { DEFAULT_AGENT_CONFIG } = getAppConfig();

  return parseAgentConfig(DEFAULT_AGENT_CONFIG) || {};
};
