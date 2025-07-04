import { DataSyncConfig, NetworkProxySettings } from '@lobechat/electron-client-ipc';

export interface ElectronMainStore {
  dataSyncConfig: DataSyncConfig;
  encryptedTokens: {
    accessToken?: string;
    refreshToken?: string;
  };
  locale: string;
  networkProxy: NetworkProxySettings;
  shortcuts: Record<string, string>;
  storagePath: string;
}

export type StoreKey = keyof ElectronMainStore;
