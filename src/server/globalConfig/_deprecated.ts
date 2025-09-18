import { ModelProvider } from '@lobechat/model-runtime';

import * as ProviderCards from '@/config/modelProviders';
import { getLLMConfig } from '@/envs/llm';
import { ModelProviderCard } from '@/types/llm';
import { extractEnabledModels, transformToChatModelCards } from '@/utils/_deprecated/parseModels';

export const genServerLLMConfig = (specificConfig: Record<any, any>) => {
  const llmConfig = getLLMConfig() as Record<string, any>;

  return Object.values(ModelProvider).reduce(
    (config, provider) => {
      const providerUpperCase = provider.toUpperCase();
      const providerCard = ProviderCards[
        `${provider}ProviderCard` as keyof typeof ProviderCards
      ] as ModelProviderCard;
      const providerConfig = specificConfig[provider as keyof typeof specificConfig] || {};
      const providerModelList =
        process.env[providerConfig.modelListKey ?? `${providerUpperCase}_MODEL_LIST`];

      config[provider] = {
        enabled: llmConfig[providerConfig.enabledKey || `ENABLED_${providerUpperCase}`],
        enabledModels: extractEnabledModels(
          providerModelList,
          providerConfig.withDeploymentName || false,
        ),
        serverModelCards: transformToChatModelCards({
          defaultChatModels: (providerCard as ModelProviderCard)?.chatModels || [],
          modelString: providerModelList,
          withDeploymentName: providerConfig.withDeploymentName || false,
        }),
        ...(providerConfig.fetchOnClient !== undefined && {
          fetchOnClient: providerConfig.fetchOnClient,
        }),
      };

      return config;
    },
    {} as Record<ModelProvider, any>,
  );
};
