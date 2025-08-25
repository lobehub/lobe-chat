import type { Migration, MigrationData } from '@/migrations/VersionController';

import { V7ConfigState } from './types/v7';
import { V8ConfigState } from './types/v8';

export class MigrationV7ToV8 implements Migration {
  // from this version to start migration
  version = 7;

  migrate(data: MigrationData<V7ConfigState>): MigrationData<V8ConfigState> {
    const { settings } = data.state;

    return {
      ...data,
      state: {
        ...data.state,
        settings: !settings ? undefined : MigrationV7ToV8.migrateSettings(settings),
      },
    };
  }

  static migrateSettings = (settings: any): any => {
    const { keyVaults, ...rest } = settings;

    if (!keyVaults) return settings;

    const migratedKeyVaults = { ...keyVaults };

    // Migrate Bedrock from AKSK to API key format
    if (
      keyVaults.bedrock &&
      ('accessKeyId' in keyVaults.bedrock || 'secretAccessKey' in keyVaults.bedrock)
    ) {
      migratedKeyVaults.bedrock = {
        apiKey: '',
        baseURL: '',
        region: keyVaults.bedrock.region || 'us-east-1',
      };
    }

    return {
      ...rest,
      keyVaults: migratedKeyVaults,
    };
  };
}

export const MigrationKeyValueSettings = MigrationV7ToV8;
