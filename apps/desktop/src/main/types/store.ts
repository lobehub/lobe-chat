import { DataSyncConfig } from '@lobechat/electron-client-ipc';

export interface ElectronMainStore {
  dataSyncConfig: DataSyncConfig;
  locale: string;
  shortcuts: Record<string, string>;
  storagePath: string;
}

export type StoreKey = keyof ElectronMainStore;
