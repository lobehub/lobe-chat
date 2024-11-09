import { appEnv, getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { langfuseEnv } from '@/config/langfuse';
import { enableNextAuth } from '@/const/auth';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';
import { GlobalServerConfig } from '@/types/serverConfig';

import { parseAgentConfig } from './parseDefaultAgent';

import { getLLMConfig } from '@/config/llm';
import * as ProviderCards from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';
import { ModelProviderCard } from '@/types/llm';
import { extractEnabledModels, transformToChatModelCards } from '@/utils/parseModels';

export const generateLLMConfig = () => {
  const llmConfig = getLLMConfig() as Record<string, any>;

  return Object.values(ModelProvider).reduce((config, provider) => {
    const providerCard = ProviderCards[`${provider}ProviderCard` as keyof typeof ProviderCards];

    config[provider] = {
      enabled: provider === ModelProvider.Azure
        ? llmConfig.ENABLED_AZURE_OPENAI
        : provider === ModelProvider.Bedrock
        ? llmConfig.ENABLED_AWS_BEDROCK
        : llmConfig[`ENABLED_${provider.toUpperCase()}`],
      enabledModels: provider === ModelProvider.Azure
        ? extractEnabledModels(llmConfig.AZURE_MODEL_LIST, true)
        : provider === ModelProvider.Bedrock
        ? extractEnabledModels(llmConfig.AWS_BEDROCK_MODEL_LIST)
        : extractEnabledModels(llmConfig[`${provider.toUpperCase()}_MODEL_LIST`]),
      serverModelCards: transformToChatModelCards({
        defaultChatModels: (providerCard as ModelProviderCard)?.chatModels || [],
        modelString: llmConfig[`${provider.toUpperCase()}_MODEL_LIST`],
        ...(provider === ModelProvider.Azure && { withDeploymentName: true }),
      }),
      ...(provider === ModelProvider.Ollama && {
        fetchOnClient: !llmConfig.OLLAMA_PROXY_URL,
      }),
    };

    return config;
  }, {} as Record<ModelProvider, any>);
};

export const getServerGlobalConfig = () => {
  const { ACCESS_CODES, DEFAULT_AGENT_CONFIG } = getAppConfig();

  const config: GlobalServerConfig = {
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,
    enabledAccessCode: ACCESS_CODES?.length > 0,
    enabledOAuthSSO: enableNextAuth,
    languageModel: generateLLMConfig(),
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
