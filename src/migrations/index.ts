import { ConfigStateAll } from '@/types/exportConfig';
import { VersionController } from '@/utils/VersionController';

import { MigrationV0ToV1 } from './FromV0ToV1';
import { MigrationV1ToV2 } from './FromV1ToV2';

// 当前最新的版本号
export const CURRENT_CONFIG_VERSION = 2;

// 历史记录版本升级模块
export const ConfigMigrations = [MigrationV0ToV1, MigrationV1ToV2];

export const Migration = new VersionController<ConfigStateAll>(
  ConfigMigrations,
  CURRENT_CONFIG_VERSION,
);
