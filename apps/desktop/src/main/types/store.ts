export interface ElectronMainStore {
  locale: string;
}

export type StoreKey = keyof ElectronMainStore;
