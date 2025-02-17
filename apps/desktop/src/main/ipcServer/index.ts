import { IpcDispatchEvent } from '@lobechat/electron-server-ipc';
import { app } from 'electron';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const userDataPath = app.getPath('userData');

const DB_SCHEMA_HASH_PATH = path.join(userDataPath, 'lobehub-local-db-schema-hash');

export const ipcEvent: IpcDispatchEvent = {
  getDatabasePath: async () => {
    return path.join(userDataPath, 'lobehub-local-db');
  },
  getDatabaseSchemaHash: async () => {
    try {
      return readFileSync(DB_SCHEMA_HASH_PATH, 'utf8');
    } catch {
      return undefined;
    }
  },

  getUserDataPath: async () => {
    return userDataPath;
  },

  setDatabaseSchemaHash: async (hash: string) => {
    writeFileSync(DB_SCHEMA_HASH_PATH, hash, 'utf8');
  },
};
