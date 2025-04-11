export interface ElectronMainStore {
  locale: string;
  shortcuts: Record<string, string>;
}

export type StoreKey = keyof ElectronMainStore;
