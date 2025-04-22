import { RemoteServerConfig } from '@lobechat/electron-client-ipc';

export interface ElectronMainStore {
  locale: string;
  shortcuts: Record<string, string>;
  storagePath: string;
  syncConfig: RemoteServerConfig;
}

export type StoreKey = keyof ElectronMainStore;
