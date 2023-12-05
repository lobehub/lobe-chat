import { t } from 'i18next';

/**
 * 迁移接口
 * @template T - 状态类型
 */
export interface Migration<T = any> {
  /**
   * 迁移数据
   * @param data - 迁移数据
   * @returns 迁移后的数据
   */
  migrate(data: MigrationData<T>): MigrationData;
  /**
   * 迁移版本号
   */
  version: number;
}

/**
 * 迁移数据接口
 * @template T - 状态类型
 */
export interface MigrationData<T = any> {
  /**
   * 状态数据
   */
  state: T;
  /**
   * 迁移版本号
   */
  version: number;
}
export class VersionController<T> {
  private migrations: Migration[];
  targetVersion: number;

  constructor(migrations: any[], targetVersion: number = migrations.length) {
    this.migrations = migrations
      .map((cls) => {
        return new cls() as Migration;
      })
      .sort((a, b) => a.version - b.version);

    this.targetVersion = targetVersion;
  }

  migrate(data: MigrationData<T>): MigrationData<T> {
    let nextData = data;
    const targetVersion = this.targetVersion || this.migrations.length;
    if (data.version === undefined)
      throw new Error(t('migrateError.missVersion', { ns: 'migration' }));
    const currentVersion = data.version;

    for (let i = currentVersion || 0; i < targetVersion; i++) {
      const migration = this.migrations.find((m) => m.version === i);
      if (!migration) throw new Error(t('migrateError.noMigration', { ns: 'migration' }));

      nextData = migration.migrate(nextData);

      nextData.version += 1;
      console.debug('迁移器：', migration, '数据：', nextData, '迁移后版本:', nextData.version);
    }

    return nextData;
  }
}
