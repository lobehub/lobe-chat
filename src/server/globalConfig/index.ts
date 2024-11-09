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
  const config: Record<ModelProvider, any> = {} as Record<ModelProvider, any>;

  const llmConfig = getLLMConfig() as Record<string, any>;

  Object.values(ModelProvider).forEach((provider) => {
    const providerFlags = {
      isAzure: provider === ModelProvider.Azure,
      isBedrock: provider === ModelProvider.Bedrock,
      isOllama: provider === ModelProvider.Ollama,
    };

    const enabledKey = `ENABLED_${provider.toUpperCase()}`;
    const modelListKey = `${provider.toUpperCase()}_MODEL_LIST`;
    const providerCard = ProviderCards[`${provider}ProviderCard` as keyof typeof ProviderCards];

    config[provider] = {
      enabled: providerFlags.isAzure 
        ? llmConfig.ENABLED_AZURE_OPENAI 
        : providerFlags.isBedrock 
        ? llmConfig.ENABLED_AWS_BEDROCK 
        : llmConfig[enabledKey],
      enabledModels: providerFlags.isBedrock 
        ? extractEnabledModels(llmConfig.AWS_BEDROCK_MODEL_LIST)
        : extractEnabledModels(llmConfig[modelListKey], providerFlags.isAzure),
      serverModelCards: transformToChatModelCards({
        defaultChatModels: providerCard && typeof providerCard === 'object' && 'chatModels' in providerCard
          ? (providerCard as ModelProviderCard).chatModels
          : [],
        modelString: llmConfig[modelListKey],
        ...(providerFlags.isAzure && { withDeploymentName: true }),
      }),
      ...(providerFlags.isOllama && {
        fetchOnClient: !llmConfig.OLLAMA_PROXY_URL,
      }),
    };
  });

  return config;
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
