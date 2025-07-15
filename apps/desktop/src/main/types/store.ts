import { DataSyncConfig, NetworkProxySettings } from '@lobechat/electron-client-ipc';

export interface ElectronMainStore {
  autoSyncSpellCheckLanguage: boolean;
  dataSyncConfig: DataSyncConfig;
  enableSpellCheck: boolean;
  encryptedTokens: {
    accessToken?: string;
    expiresAt?: number;
    refreshToken?: string;
  };
  locale: string;
  networkProxy: NetworkProxySettings;
  shortcuts: Record<string, string>;
  spellCheckLanguages: string[];
  storagePath: string;
  zoomFactor: number;
}

export type StoreKey = keyof ElectronMainStore;
