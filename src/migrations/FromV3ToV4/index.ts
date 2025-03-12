import type { Migration, MigrationData } from '@/migrations/VersionController';
import { transformToChatModelCards } from '@/utils/_deprecated/parseModels';

import { V3ConfigState, V3LegacyConfig, V3OpenAIConfig, V3Settings } from './types/v3';
import { V4AzureOpenAIConfig, V4ConfigState, V4ProviderConfig, V4Settings } from './types/v4';

export class MigrationV3ToV4 implements Migration {
  // from this version to start migration
  version = 3;

  migrate(data: MigrationData<V3ConfigState>): MigrationData<V4ConfigState> {
    const { settings } = data.state;

    return {
      ...data,
      state: {
        ...data.state,
        settings: !settings ? undefined : MigrationV3ToV4.migrateSettings(settings),
      },
    };
  }

  static migrateSettings = (settings: V3Settings): V4Settings => {
    const { languageModel } = settings;

    if (!languageModel) return { ...settings, languageModel: undefined };

    const { openAI, togetherai, openrouter, ollama, ...res } = languageModel;
    const { openai, azure } = this.migrateOpenAI(openAI);

    return {
      ...settings,
      languageModel: {
        ...res,
        azure,
        ollama: ollama && this.migrateProvider(ollama),
        openai,
        openrouter: openrouter && this.migrateProvider(openrouter),
        togetherai: togetherai && this.migrateProvider(togetherai),
      },
    };
  };

  static migrateOpenAI = (
    openai?: V3OpenAIConfig,
  ): { azure: V4AzureOpenAIConfig; openai: V4ProviderConfig } => {
    if (!openai)
      return {
        azure: { apiKey: '', enabled: false },
        openai: { apiKey: '', enabled: true },
      };

    if (openai.useAzure) {
      return {
        azure: {
          apiKey: openai.OPENAI_API_KEY,
          apiVersion: openai.azureApiVersion,
          enabled: true,
          endpoint: openai.endpoint,
        },
        openai: { apiKey: '', enabled: true, endpoint: '' },
      };
    }

    const customModelCards = transformToChatModelCards({
      defaultChatModels: [],
      modelString: openai.customModelName,
    });

    return {
      azure: {
        apiKey: '',
        enabled: false,
        endpoint: '',
      },
      openai: {
        apiKey: openai.OPENAI_API_KEY,
        customModelCards:
          customModelCards && customModelCards.length > 0 ? customModelCards : undefined,
        enabled: true,
        endpoint: openai.endpoint,
      },
    };
  };

  static migrateProvider = (provider: V3LegacyConfig): V4ProviderConfig => {
    const customModelCards = transformToChatModelCards({
      defaultChatModels: [],
      modelString: provider.customModelName,
    });

    return {
      apiKey: provider.apiKey,
      customModelCards:
        customModelCards && customModelCards.length > 0 ? customModelCards : undefined,
      enabled: provider.enabled,
      endpoint: provider.endpoint,
    };
  };
}

export const MigrationLLMSettings = MigrationV3ToV4;
