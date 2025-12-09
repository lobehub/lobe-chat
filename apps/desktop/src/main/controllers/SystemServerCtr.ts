import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { DB_SCHEMA_HASH_FILENAME, LOCAL_DATABASE_DIR, userDataDir } from '@/const/dir';

import { ControllerModule, IpcServerMethod } from './index';

export default class SystemServerCtr extends ControllerModule {
  static override readonly groupName = 'system';

  @IpcServerMethod()
  async getDatabasePath() {
    return join(this.app.appStoragePath, LOCAL_DATABASE_DIR);
  }

  @IpcServerMethod()
  async getDatabaseSchemaHash() {
    try {
      return readFileSync(this.DB_SCHEMA_HASH_PATH, 'utf8');
    } catch {
      return undefined;
    }
  }

  @IpcServerMethod()
  async getUserDataPath() {
    return userDataDir;
  }

  @IpcServerMethod()
  async setDatabaseSchemaHash(hash: string) {
    writeFileSync(this.DB_SCHEMA_HASH_PATH, hash, 'utf8');
  }

  private get DB_SCHEMA_HASH_PATH() {
    return join(this.app.appStoragePath, DB_SCHEMA_HASH_FILENAME);
  }
}
