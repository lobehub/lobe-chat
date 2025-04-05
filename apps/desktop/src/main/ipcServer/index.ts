import { IpcDispatchEvent } from '@lobechat/electron-server-ipc';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { userDataDir } from '@/const/dir';

const DB_SCHEMA_HASH_PATH = path.join(userDataDir, 'lobehub-local-db-schema-hash');

export const ipcEvent: IpcDispatchEvent = {
  getDatabasePath: async () => {
    return path.join(userDataDir, 'lobehub-local-db');
  },

  getDatabaseSchemaHash: async () => {
    try {
      return readFileSync(DB_SCHEMA_HASH_PATH, 'utf8');
    } catch {
      return undefined;
    }
  },

  getUserDataPath: async () => {
    return userDataDir;
  },

  setDatabaseSchemaHash: async (hash: string) => {
    writeFileSync(DB_SCHEMA_HASH_PATH, hash, 'utf8');
  },
};
