export interface ElectronMainStore {
  active?: boolean;
  isSelfHosted: boolean;
  locale: string;
  remoteServerUrl?: string;
  shortcuts: Record<string, string>;
  storagePath: string;
}

export type StoreKey = keyof ElectronMainStore;
