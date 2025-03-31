/* eslint-disable typescript-sort-keys/interface, sort-keys-fix/sort-keys-fix */
export const ElectronIPCMethods = {
  getDatabasePath: 'getDatabasePath',
  getUserDataPath: 'getUserDataPath',

  getDatabaseSchemaHash: 'getDatabaseSchemaHash',
  setDatabaseSchemaHash: 'setDatabaseSchemaHash',
} as const;

export type IElectronIPCMethods = keyof typeof ElectronIPCMethods;

export interface IpcDispatchEvent {
  getDatabasePath: () => Promise<string>;
  getUserDataPath: () => Promise<string>;

  getDatabaseSchemaHash: () => Promise<string | undefined>;
  setDatabaseSchemaHash: (hash: string) => Promise<void>;
}
