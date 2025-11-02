import { ProviderConfig } from '@lobechat/types';
import { extractEnabledModels, transformToAiModelList } from '@lobechat/utils';
import { AiFullModelCard, ModelProvider } from 'model-bank';
import * as AiModels from 'model-bank';

import { getLLMConfig } from '@/envs/llm';

interface ProviderSpecificConfig {
  enabled?: boolean;
  enabledKey?: string;
  fetchOnClient?: boolean;
  modelListKey?: string;
  withDeploymentName?: boolean;
}

export const genServerAiProvidersConfig = async (
  specificConfig: Record<any, ProviderSpecificConfig>,
) => {
  const llmConfig = getLLMConfig() as Record<string, any>;

  // Filter out disabled providers early to speed up dev startup
  const isDev = process.env.NODE_ENV === 'development';
  // Set to false to disable provider skipping optimization temporarily
  const enableProviderSkipping = isDev && process.env.DISABLE_PROVIDER_SKIP !== '1';

  // Pre-filter providers in dev mode to skip disabled ones early
  const allProviders = Object.values(ModelProvider);
  let providersToProcess = allProviders;

  if (enableProviderSkipping) {
    const startTime = Date.now();
    providersToProcess = allProviders.filter((provider) => {
      try {
        const providerConfig = specificConfig[provider as keyof typeof specificConfig] || {};
        const providerUpperCase = provider.toUpperCase();
        const enabled =
          typeof providerConfig.enabled !== 'undefined'
            ? providerConfig.enabled
            : llmConfig[providerConfig.enabledKey || `ENABLED_${providerUpperCase}`];
        // In dev mode, skip disabled providers to speed up startup
        return enabled !== false;
      } catch (error) {
        // If error checking, include provider to be safe
        console.warn(`[Dev] Error checking provider ${provider}, including it:`, error);
        return true;
      }
    });
    const filterTime = Date.now() - startTime;

    if (providersToProcess.length < allProviders.length) {
      console.log(
        `⚡ [Dev] Skipping ${allProviders.length - providersToProcess.length} disabled providers for faster startup (filtered in ${filterTime}ms)`,
      );
    } else {
      console.log(`ℹ️ [Dev] Processing all ${allProviders.length} providers`);
    }
  }

  // 并发处理所有 providers (optimized for dev mode)
  const processStartTime = Date.now();
  if (isDev && providersToProcess.length > 0) {
    console.log(
      `⏳ [Dev] Processing ${providersToProcess.length} of ${allProviders.length} providers...`,
    );
  }

  const providerConfigs = await Promise.all(
    providersToProcess.map(async (provider) => {
      const providerStartTime = Date.now();
      try {
        const providerUpperCase = provider.toUpperCase();
        const aiModels = AiModels[provider] as AiFullModelCard[];

        if (!aiModels)
          throw new Error(
            `Provider [${provider}] not found in aiModels, please make sure you have exported the provider in the \`aiModels/index.ts\``,
          );

        const providerConfig = specificConfig[provider as keyof typeof specificConfig] || {};
        const modelString =
          process.env[providerConfig.modelListKey ?? `${providerUpperCase}_MODEL_LIST`];

        // 并发处理 extractEnabledModels 和 transformToAiModelList
        const [enabledModels, serverModelLists] = await Promise.all([
          extractEnabledModels(provider, modelString, providerConfig.withDeploymentName || false),
          transformToAiModelList({
            defaultModels: aiModels || [],
            modelString,
            providerId: provider,
            withDeploymentName: providerConfig.withDeploymentName || false,
          }),
        ]);

        const providerTime = Date.now() - providerStartTime;
        if (isDev && providerTime > 1000) {
          console.log(`  ⚠️ [Dev] Provider ${provider} took ${providerTime}ms`);
        }

        return {
          config: {
            enabled:
              typeof providerConfig.enabled !== 'undefined'
                ? providerConfig.enabled
                : llmConfig[providerConfig.enabledKey || `ENABLED_${providerUpperCase}`],
            enabledModels,
            serverModelLists,
            ...(providerConfig.fetchOnClient !== undefined && {
              fetchOnClient: providerConfig.fetchOnClient,
            }),
          },
          provider,
        };
      } catch (error) {
        console.error(`❌ [Dev] Error processing provider ${provider}:`, error);
        throw error;
      }
    }),
  );

  const processTime = Date.now() - processStartTime;
  if (isDev && providersToProcess.length > 0) {
    console.log(`✅ [Dev] Processed ${providersToProcess.length} providers in ${processTime}ms`);
  }

  // 将结果转换为对象
  const config = {} as Record<string, ProviderConfig>;
  for (const { provider, config: providerConfig } of providerConfigs) {
    config[provider] = providerConfig;
  }

  // In dev mode, add minimal configs for skipped providers to avoid breaking
  if (isDev) {
    for (const provider of allProviders) {
      if (!config[provider]) {
        const providerConfig = specificConfig[provider as keyof typeof specificConfig] || {};
        config[provider] = {
          enabled: false,
          enabledModels: [],
          serverModelLists: [],
          ...(providerConfig.fetchOnClient !== undefined && {
            fetchOnClient: providerConfig.fetchOnClient,
          }),
        };
      }
    }
  }

  return config;
};
