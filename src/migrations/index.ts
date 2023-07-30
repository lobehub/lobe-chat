import { ConfigStateAll } from '@/types/exportConfig';
import { VersionController } from '@/utils/VersionController';

// 当前最新的版本号
export const CURRENT_CONFIG_VERSION = 1;

// 历史记录版本升级模块
export const ConfigMigrations = [];

export const Migration = new VersionController<ConfigStateAll>(
  ConfigMigrations,
  CURRENT_CONFIG_VERSION,
);
