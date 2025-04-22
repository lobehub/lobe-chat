import { RemoteServerConfig } from '@lobechat/electron-client-ipc';

export interface ElectronMainStore {
  locale: string;
  remoteServerConfig: RemoteServerConfig;
  shortcuts: Record<string, string>;
  storagePath: string;
}

export type StoreKey = keyof ElectronMainStore;
