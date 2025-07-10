import { DataSyncConfig } from '@lobechat/electron-client-ipc';

export interface ElectronMainStore {
  dataSyncConfig: DataSyncConfig;
  encryptedTokens: {
    accessToken?: string;
    refreshToken?: string;
  };
  locale: string;
  shortcuts: Record<string, string>;
  storagePath: string;
}

export type StoreKey = keyof ElectronMainStore;
