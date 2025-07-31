import * as AiModels from '@/config/aiModels';
import { getLLMConfig } from '@/config/llm';
import { ModelProvider } from '@/libs/model-runtime';
import { AiFullModelCard } from '@/types/aiModel';
import { ProviderConfig } from '@/types/user/settings';
import { extractEnabledModels, transformToAiModelList } from '@/utils/parseModels';

interface ProviderSpecificConfig {
  enabled?: boolean;
  enabledKey?: string;
  fetchOnClient?: boolean;
  modelListKey?: string;
  withDeploymentName?: boolean;
}

export const genServerAiProvidersConfig = (specificConfig: Record<any, ProviderSpecificConfig>) => {
  const llmConfig = getLLMConfig() as Record<string, any>;

  return Object.values(ModelProvider).reduce(
    (config, provider) => {
      const providerUpperCase = provider.toUpperCase();
      const aiModels = AiModels[provider] as AiFullModelCard[];

      if (!aiModels)
        throw new Error(
          `Provider [${provider}] not found in aiModels, please make sure you have exported the provider in the \`aiModels/index.ts\``,
        );

      const providerConfig = specificConfig[provider as keyof typeof specificConfig] || {};
      const modelString =
        process.env[providerConfig.modelListKey ?? `${providerUpperCase}_MODEL_LIST`];

      config[provider] = {
        enabled:
          typeof providerConfig.enabled !== 'undefined'
            ? providerConfig.enabled
            : llmConfig[providerConfig.enabledKey || `ENABLED_${providerUpperCase}`],

        enabledModels: extractEnabledModels(
          provider,
          modelString,
          providerConfig.withDeploymentName || false,
        ),
        serverModelLists: transformToAiModelList({
          defaultModels: aiModels || [],
          modelString,
          providerId: provider,
          withDeploymentName: providerConfig.withDeploymentName || false,
        }),
        ...(providerConfig.fetchOnClient !== undefined && {
          fetchOnClient: providerConfig.fetchOnClient,
        }),
      };

      return config;
    },
    {} as Record<string, ProviderConfig>,
  );
};
