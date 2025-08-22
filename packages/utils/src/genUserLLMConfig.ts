import { ModelProvider } from '@lobechat/model-runtime';

import * as ProviderCards from '@/config/modelProviders';
import { ModelProviderCard } from '@/types/llm';
import { UserModelProviderConfig } from '@/types/user/settings';

export const genUserLLMConfig = (specificConfig: Record<any, any>): UserModelProviderConfig => {
  return Object.keys(ModelProvider).reduce((config, providerKey) => {
    const provider = ModelProvider[providerKey as keyof typeof ModelProvider];
    const providerCard = ProviderCards[
      `${providerKey}ProviderCard` as keyof typeof ProviderCards
    ] as ModelProviderCard;
    const providerConfig = specificConfig[provider as keyof typeof specificConfig] || {};

    config[provider] = {
      enabled: providerConfig.enabled !== undefined ? providerConfig.enabled : false,
      enabledModels: providerCard ? ProviderCards.filterEnabledModels(providerCard) : [],
      ...(providerConfig.fetchOnClient !== undefined && {
        fetchOnClient: providerConfig.fetchOnClient,
      }),
    };

    return config;
  }, {} as UserModelProviderConfig);
};
