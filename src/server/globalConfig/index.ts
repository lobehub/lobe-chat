import { appEnv, getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { langfuseEnv } from '@/config/langfuse';
import { getLLMConfig } from '@/config/llm';
import {
  BedrockProviderCard,
  FireworksAIProviderCard,
  GithubProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  NovitaProviderCard,
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  QwenProviderCard,
  SiliconCloudProviderCard,
  TogetherAIProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
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
    ZHIPU_MODEL_LIST,

    ENABLED_AWS_BEDROCK,
    AWS_BEDROCK_MODEL_LIST,

    ENABLED_GOOGLE,
    GOOGLE_MODEL_LIST,

    ENABLED_GROQ,
    GROQ_MODEL_LIST,

    ENABLED_GITHUB,
    GITHUB_MODEL_LIST,

    ENABLED_DEEPSEEK,
    ENABLED_PERPLEXITY,
    ENABLED_ANTHROPIC,
    ENABLED_MINIMAX,
    ENABLED_MISTRAL,

    ENABLED_NOVITA,
    NOVITA_MODEL_LIST,

    ENABLED_QWEN,
    QWEN_MODEL_LIST,

    ENABLED_STEPFUN,
    ENABLED_BAICHUAN,
    ENABLED_TAICHU,
    ENABLED_AI21,
    ENABLED_AI360,

    ENABLED_SILICONCLOUD,
    SILICONCLOUD_MODEL_LIST,

    ENABLED_UPSTAGE,

    ENABLED_SPARK,

    ENABLED_AZURE_OPENAI,
    AZURE_MODEL_LIST,

    ENABLED_OLLAMA,
    OLLAMA_MODEL_LIST,
    OLLAMA_PROXY_URL,

    ENABLED_OPENROUTER,
    OPENROUTER_MODEL_LIST,

    ENABLED_ZEROONE,
    ZEROONE_MODEL_LIST,

    ENABLED_TOGETHERAI,
    TOGETHERAI_MODEL_LIST,

    ENABLED_FIREWORKSAI,
    FIREWORKSAI_MODEL_LIST,
  } = getLLMConfig();

  const config: GlobalServerConfig = {
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,
    enabledAccessCode: ACCESS_CODES?.length > 0,
    enabledOAuthSSO: enableNextAuth,
    languageModel: {
      ai21: { enabled: ENABLED_AI21 },
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
      bedrock: {
        enabled: ENABLED_AWS_BEDROCK,
        enabledModels: extractEnabledModels(AWS_BEDROCK_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: BedrockProviderCard.chatModels,
          modelString: AWS_BEDROCK_MODEL_LIST,
        }),
      },
      deepseek: { enabled: ENABLED_DEEPSEEK },

      fireworksai: {
        enabled: ENABLED_FIREWORKSAI,
        enabledModels: extractEnabledModels(FIREWORKSAI_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: FireworksAIProviderCard.chatModels,
          modelString: FIREWORKSAI_MODEL_LIST,
        }),
      },

      github: {
        enabled: ENABLED_GITHUB,
        enabledModels: extractEnabledModels(GITHUB_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: GithubProviderCard.chatModels,
          modelString: GITHUB_MODEL_LIST,
        }),
      },
      google: {
        enabled: ENABLED_GOOGLE,
        enabledModels: extractEnabledModels(GOOGLE_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: GoogleProviderCard.chatModels,
          modelString: GOOGLE_MODEL_LIST,
        }),
      },
      groq: {
        enabled: ENABLED_GROQ,
        enabledModels: extractEnabledModels(GROQ_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: GroqProviderCard.chatModels,
          modelString: GROQ_MODEL_LIST,
        }),
      },
      minimax: { enabled: ENABLED_MINIMAX },
      mistral: { enabled: ENABLED_MISTRAL },
      moonshot: { enabled: ENABLED_MOONSHOT },
      novita: {
        enabled: ENABLED_NOVITA,
        enabledModels: extractEnabledModels(NOVITA_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: NovitaProviderCard.chatModels,
          modelString: NOVITA_MODEL_LIST,
        }),
      },
      ollama: {
        enabled: ENABLED_OLLAMA,
        enabledModels: extractEnabledModels(OLLAMA_MODEL_LIST),
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
      qwen: {
        enabled: ENABLED_QWEN,
        enabledModels: extractEnabledModels(QWEN_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: QwenProviderCard.chatModels,
          modelString: QWEN_MODEL_LIST,
        }),
      },
      siliconcloud: {
        enabled: ENABLED_SILICONCLOUD,
        enabledModels: extractEnabledModels(SILICONCLOUD_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: SiliconCloudProviderCard.chatModels,
          modelString: SILICONCLOUD_MODEL_LIST,
        }),
      },
      spark: { enabled: ENABLED_SPARK },
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
      upstage: { enabled: ENABLED_UPSTAGE },
      zeroone: {
        enabled: ENABLED_ZEROONE,
        enabledModels: extractEnabledModels(ZEROONE_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: ZeroOneProviderCard.chatModels,
          modelString: ZEROONE_MODEL_LIST,
        }),
      },
      zhipu: {
        enabled: ENABLED_ZHIPU,
        enabledModels: extractEnabledModels(ZHIPU_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: ZhiPuProviderCard.chatModels,
          modelString: ZHIPU_MODEL_LIST,
        }),
      },
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
