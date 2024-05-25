import type { Migration, MigrationData } from '@/migrations/VersionController';

import { V6ConfigState, V6Settings } from './types/v6';
import { V7ConfigState, V7Settings } from './types/v7';

export class MigrationV6ToV7 implements Migration {
  // from this version to start migration
  version = 6;

  migrate(data: MigrationData<V6ConfigState>): MigrationData<V7ConfigState> {
    const { settings } = data.state;

    return {
      ...data,
      state: {
        ...data.state,
        settings: !settings ? undefined : MigrationV6ToV7.migrateSettings(settings),
      },
    };
  }

  static migrateSettings = (settings: V6Settings): V7Settings => {
    const {
      languageModel,
      password,
      neutralColor,
      themeMode,
      fontSize,
      primaryColor,
      language,
      ...res
    } = settings;
    return {
      ...res,
      general: {
        fontSize,
        language,
        neutralColor,
        primaryColor,
        themeMode,
      },
      // @ts-ignore
      keyVaults: {
        password,
      },

      // @ts-ignore
      languageModel,
    };
  };
}

export const MigrationKeyValueSettings = MigrationV6ToV7;
