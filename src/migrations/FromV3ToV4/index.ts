import type { Migration, MigrationData } from '@/migrations/VersionController';

import { V3ConfigState, V3LegacyConfig, V3OpenAIConfig, V3Settings } from './types/v3';
import { V4ConfigState, V4ProviderConfig, V4Settings } from './types/v4';

export class MigrationV3ToV4 implements Migration {
  // from this version to start migration
  version = 3;

  migrate(data: MigrationData<V3ConfigState>): MigrationData<V4ConfigState> {
    const { settings } = data.state;

    return {
      ...data,
      state: {
        ...data.state,
        settings: this.migrateSettings(settings),
      },
    };
  }

  migrateSettings = (settings: V3Settings): V4Settings => {
    const { languageModel } = settings;
    const { openAI, togetherai, openrouter, ollama, ...res } = languageModel;
    const { openai, azure } = this.migrateOpenAI(openAI);

    return {
      ...settings,
      languageModel: {
        ...res,
        azure,
        ollama: this.migrateProvider(ollama),
        openai,
        openrouter: this.migrateProvider(openrouter),
        togetherai: this.migrateProvider(togetherai),
      },
    };
  };

  migrateOpenAI = (
    openai: V3OpenAIConfig,
  ): { azure: V4ProviderConfig; openai: V4ProviderConfig } => {
    if (openai.useAzure) {
      return {
        azure: {
          apiKey: openai.OPENAI_API_KEY,
          enabled: true,
          enabledModels: null,
          endpoint: openai.endpoint,
        },
        openai: {
          enabled: true,
          enabledModels: null,
        },
      };
    }

    return {
      azure: {
        enabledModels: null,
      },
      openai: {
        apiKey: openai.OPENAI_API_KEY,
        enabled: true,
        enabledModels: null,
        endpoint: openai.endpoint,
        // customModelCards:openai.customModelName
      },
    };
  };

  migrateProvider = (provider: V3LegacyConfig): V4ProviderConfig => {
    return {
      apiKey: provider.apiKey,
      enabled: provider.enabled,
      enabledModels: [],
      endpoint: provider.endpoint,
    };
  };
}
