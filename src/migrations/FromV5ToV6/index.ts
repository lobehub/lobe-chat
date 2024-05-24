import type { Migration, MigrationData } from '@/migrations/VersionController';

import { V5ConfigState, V5Session } from './types/v5';
import { V6ConfigState, V6Session } from './types/v6';

export class MigrationV5ToV6 implements Migration {
  // from this version to start migration
  version = 5;

  migrate(data: MigrationData<V5ConfigState>): MigrationData<V6ConfigState> {
    const { sessions } = data.state;

    return {
      ...data,
      state: {
        ...data.state,
        sessions: MigrationV5ToV6.migrateSession(sessions),
      },
    };
  }

  static migrateSession(sessions: V5Session[]): V6Session[] {
    return sessions.map(({ config, updateAt, updatedAt, createdAt, createAt, ...res }) => {
      const {
        autoCreateTopicThreshold,
        enableAutoCreateTopic,
        compressThreshold,
        enableCompressThreshold,
        enableHistoryCount,
        enableMaxTokens,
        historyCount,
        inputTemplate,
        displayMode,
        ...agentConfig
      } = config;
      return {
        ...res,
        config: {
          ...agentConfig,
          chatConfig: {
            autoCreateTopicThreshold,
            compressThreshold,
            displayMode,
            enableAutoCreateTopic,
            enableCompressThreshold,
            enableHistoryCount,
            enableMaxTokens,
            historyCount,
            inputTemplate,
          },
        },
        createdAt: createdAt || createAt!,
        updatedAt: updatedAt || updateAt!,
      };
    });
  }
}
