import { appEnv, getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { langfuseEnv } from '@/config/langfuse';
import { getLLMConfig } from '@/config/llm';
import {
  Ai21ProviderCard,
  Ai360ProviderCard,
  AnthropicProviderCard,
  BaichuanProviderCard,
  BedrockProviderCard,
  DeepSeekProviderCard,
  FireworksAIProviderCard,
  GithubProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  HuggingFaceProviderCard,
  HunyuanProviderCard,
  MinimaxProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  NovitaProviderCard,
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  QwenProviderCard,
  SenseNovaProviderCard,
  SiliconCloudProviderCard,
  SparkProviderCard,
  StepfunProviderCard,
  TaichuProviderCard,
  TogetherAIProviderCard,
  UpstageProviderCard,
  WenxinProviderCard,
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
    MOONSHOT_MODEL_LIST,

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

    ENABLED_HUNYUAN,
    HUNYUAN_MODEL_LIST,

    ENABLED_DEEPSEEK,
    DEEPSEEK_MODEL_LIST,

    ENABLED_PERPLEXITY,
    PERPLEXITY_MODEL_LIST,

    ENABLED_ANTHROPIC,
    ANTHROPIC_MODEL_LIST,

    ENABLED_MINIMAX,
    MINIMAX_MODEL_LIST,

    ENABLED_MISTRAL,
    MISTRAL_MODEL_LIST,

    ENABLED_NOVITA,
    NOVITA_MODEL_LIST,

    ENABLED_QWEN,
    QWEN_MODEL_LIST,

    ENABLED_STEPFUN,
    STEPFUN_MODEL_LIST,

    ENABLED_BAICHUAN,
    BAICHUAN_MODEL_LIST,

    ENABLED_TAICHU,
    TAICHU_MODEL_LIST,

    ENABLED_AI21,
    AI21_MODEL_LIST,

    ENABLED_AI360,
    AI360_MODEL_LIST,

    ENABLED_SENSENOVA,
    SENSENOVA_MODEL_LIST,

    ENABLED_SILICONCLOUD,
    SILICONCLOUD_MODEL_LIST,

    ENABLED_UPSTAGE,
    UPSTAGE_MODEL_LIST,

    ENABLED_SPARK,
    SPARK_MODEL_LIST,

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

    ENABLED_WENXIN,
    WENXIN_MODEL_LIST,

    ENABLED_HUGGINGFACE,
    HUGGINGFACE_MODEL_LIST,
  } = getLLMConfig();

  const config: GlobalServerConfig = {
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,
    enabledAccessCode: ACCESS_CODES?.length > 0,
    enabledOAuthSSO: enableNextAuth,
    languageModel: {
      ai21: {
        enabled: ENABLED_AI21,
        enabledModels: extractEnabledModels(AI21_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: Ai21ProviderCard.chatModels,
          modelString: AI21_MODEL_LIST,
        }),
      },
      ai360: {
        enabled: ENABLED_AI360,
        enabledModels: extractEnabledModels(AI360_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: Ai360ProviderCard.chatModels,
          modelString: AI360_MODEL_LIST,
        }),
      },
      anthropic: {
        enabled: ENABLED_ANTHROPIC,
        enabledModels: extractEnabledModels(ANTHROPIC_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: AnthropicProviderCard.chatModels,
          modelString: ANTHROPIC_MODEL_LIST,
        }),
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
      baichuan: {
        enabled: ENABLED_BAICHUAN,
        enabledModels: extractEnabledModels(BAICHUAN_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: BaichuanProviderCard.chatModels,
          modelString: BAICHUAN_MODEL_LIST,
        }),
      },
      bedrock: {
        enabled: ENABLED_AWS_BEDROCK,
        enabledModels: extractEnabledModels(AWS_BEDROCK_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: BedrockProviderCard.chatModels,
          modelString: AWS_BEDROCK_MODEL_LIST,
        }),
      },
      deepseek: {
        enabled: ENABLED_DEEPSEEK,
        enabledModels: extractEnabledModels(DEEPSEEK_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: DeepSeekProviderCard.chatModels,
          modelString: DEEPSEEK_MODEL_LIST,
        }),
      },
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
      huggingface: {
        enabled: ENABLED_HUGGINGFACE,
        enabledModels: extractEnabledModels(HUGGINGFACE_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: HuggingFaceProviderCard.chatModels,
          modelString: HUGGINGFACE_MODEL_LIST,
        }),
      },
      hunyuan: {
        enabled: ENABLED_HUNYUAN,
        enabledModels: extractEnabledModels(HUNYUAN_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: HunyuanProviderCard.chatModels,
          modelString: HUNYUAN_MODEL_LIST,
        }),
      },
      minimax: {
        enabled: ENABLED_MINIMAX,
        enabledModels: extractEnabledModels(MINIMAX_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: MinimaxProviderCard.chatModels,
          modelString: MINIMAX_MODEL_LIST,
        }),
      },
      mistral: {
        enabled: ENABLED_MISTRAL,
        enabledModels: extractEnabledModels(MISTRAL_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: MistralProviderCard.chatModels,
          modelString: MISTRAL_MODEL_LIST,
        }),
      },
      moonshot: {
        enabled: ENABLED_MOONSHOT,
        enabledModels: extractEnabledModels(MOONSHOT_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: MoonshotProviderCard.chatModels,
          modelString: MOONSHOT_MODEL_LIST,
        }),
      },
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
      perplexity: {
        enabled: ENABLED_PERPLEXITY,
        enabledModels: extractEnabledModels(PERPLEXITY_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: PerplexityProviderCard.chatModels,
          modelString: PERPLEXITY_MODEL_LIST,
        }),
      },
      qwen: {
        enabled: ENABLED_QWEN,
        enabledModels: extractEnabledModels(QWEN_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: QwenProviderCard.chatModels,
          modelString: QWEN_MODEL_LIST,
        }),
      },
      sensenova: {
        enabled: ENABLED_SENSENOVA,
        enabledModels: extractEnabledModels(SENSENOVA_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: SenseNovaProviderCard.chatModels,
          modelString: SENSENOVA_MODEL_LIST,
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
      spark: {
        enabled: ENABLED_SPARK,
        enabledModels: extractEnabledModels(SPARK_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: SparkProviderCard.chatModels,
          modelString: SPARK_MODEL_LIST,
        }),
      },
      stepfun: {
        enabled: ENABLED_STEPFUN,
        enabledModels: extractEnabledModels(STEPFUN_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: StepfunProviderCard.chatModels,
          modelString: STEPFUN_MODEL_LIST,
        }),
      },
      taichu: {
        enabled: ENABLED_TAICHU,
        enabledModels: extractEnabledModels(TAICHU_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: TaichuProviderCard.chatModels,
          modelString: TAICHU_MODEL_LIST,
        }),
      },
      togetherai: {
        enabled: ENABLED_TOGETHERAI,
        enabledModels: extractEnabledModels(TOGETHERAI_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: TogetherAIProviderCard.chatModels,
          modelString: TOGETHERAI_MODEL_LIST,
        }),
      },
      upstage: {
        enabled: ENABLED_UPSTAGE,
        enabledModels: extractEnabledModels(UPSTAGE_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: UpstageProviderCard.chatModels,
          modelString: UPSTAGE_MODEL_LIST,
        }),
      },
      wenxin: {
        enabled: ENABLED_WENXIN,
        enabledModels: extractEnabledModels(WENXIN_MODEL_LIST),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: WenxinProviderCard.chatModels,
          modelString: WENXIN_MODEL_LIST,
        }),
      },
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
