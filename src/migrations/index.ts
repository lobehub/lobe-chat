import { MigrationV2ToV3 } from '@/migrations/FromV2ToV3';
import { VersionController } from '@/migrations/VersionController';
import { ConfigStateAll } from '@/types/exportConfig';

import { MigrationV0ToV1 } from './FromV0ToV1';
import { MigrationV1ToV2 } from './FromV1ToV2';
import { MigrationV3ToV4 } from './FromV3ToV4';
import { MigrationV4ToV5 } from './FromV4ToV5';
import { MigrationV5ToV6 } from './FromV5ToV6';

// Current latest version
export const CURRENT_CONFIG_VERSION = 6;

// Version migrations module
const ConfigMigrations = [
  /**
   * 2024.05.24
   *
   * some config in agentConfig change to chatConfig
   */
  MigrationV5ToV6,
  /**
   * 2024.05.11
   *
   * role=function to role=tool
   */
  MigrationV4ToV5,
  /**
   * 2024.04.09
   * settings migrate the `languageModel`
   * - from `openAI` to `openai`, `azure`
   * - from customModelName to `enabledModels` and `customModelCards`
   */
  MigrationV3ToV4,
  /**
   * 2024.01.22
   * from `group = pinned` to `pinned:true`
   */
  MigrationV2ToV3,
  /**
   * 2023.11.27
   * 从单 key 数据库转换为基于 dexie 的关系型结构
   */
  MigrationV1ToV2,
  /**
   * 2023.07.11
   * just the first version, Nothing to do
   */
  MigrationV0ToV1,
];

export const Migration = new VersionController<ConfigStateAll>(
  ConfigMigrations,
  CURRENT_CONFIG_VERSION,
);
