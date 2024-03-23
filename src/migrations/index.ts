import { MigrationV2ToV3 } from '@/migrations/FromV2ToV3';
import { VersionController } from '@/migrations/VersionController';
import { ConfigStateAll } from '@/types/exportConfig';

import { MigrationV0ToV1 } from './FromV0ToV1';
import { MigrationV1ToV2 } from './FromV1ToV2';

// 当前最新的版本号
export const CURRENT_CONFIG_VERSION = 3;

// 历史记录版本升级模块
const ConfigMigrations = [
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
