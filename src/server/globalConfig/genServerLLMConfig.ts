import { getLLMConfig } from '@/config/llm';
import * as ProviderCards from '@/config/modelProviders';

import { ModelProvider } from '@/libs/agent-runtime';

import { extractEnabledModels, transformToChatModelCards } from '@/utils/parseModels';

import { ModelProviderCard } from '@/types/llm';

export const genServerLLMConfig = () => {
  const llmConfig = getLLMConfig() as Record<string, any>;

  const specificConfig: Record<any, any> = {
    azure: {
      enabledKey: 'ENABLED_AZURE_OPENAI',
      withDeploymentName: true,
    },
    bedrock: {
      enabledKey: 'ENABLED_AWS_BEDROCK',
      modelListKey: 'AWS_BEDROCK_MODEL_LIST',
    },
    ollama: {
      fetchOnClient: !llmConfig.OLLAMA_PROXY_URL,
    },
  };

  return Object.values(ModelProvider).reduce((config, provider) => {
    const providerUpperCase = provider.toUpperCase();
    const providerCard = ProviderCards[`${provider}ProviderCard` as keyof typeof ProviderCards] as ModelProviderCard;
    const providerConfig = specificConfig[provider as keyof typeof specificConfig] || {};

    config[provider] = {
      enabled: llmConfig[providerConfig.enabledKey || `ENABLED_${providerUpperCase}`],
      enabledModels: extractEnabledModels(
        llmConfig[providerConfig.modelListKey || `${providerUpperCase}_MODEL_LIST`],
        providerConfig.withDeploymentName || false,
      ),
      serverModelCards: transformToChatModelCards({
        defaultChatModels: (providerCard as ModelProviderCard)?.chatModels || [],
        modelString: llmConfig[providerConfig.modelListKey || `${providerUpperCase}_MODEL_LIST`],
        withDeploymentName: providerConfig.withDeploymentName || false,
      }),
      ...(providerConfig.fetchOnClient !== undefined && { fetchOnClient: providerConfig.fetchOnClient }),
    };

    return config;
  }, {} as Record<ModelProvider, any>);
};
