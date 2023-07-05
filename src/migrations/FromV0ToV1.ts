import type { Migration, MigrationData } from '../utils/VersionController';

export class MigrationV0ToV1 implements Migration {
  /***
   * 配置项里的当前版本号
   */
  version = 0;

  migrate(data: MigrationData): MigrationData {
    return data;
  }
}
