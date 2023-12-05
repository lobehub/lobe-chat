import type { Migration, MigrationData } from './VersionController';

export class MigrationV0ToV1 implements Migration {
  // from this version to start migration
  version = 0;

  migrate(data: MigrationData): MigrationData {
    return data;
  }
}
