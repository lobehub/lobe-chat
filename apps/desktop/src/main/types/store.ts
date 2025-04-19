export interface ElectronMainStore {
  active?: boolean;
  locale: string;
  remoteServerUrl?: string;
  shortcuts: Record<string, string>;
}

export type StoreKey = keyof ElectronMainStore;
