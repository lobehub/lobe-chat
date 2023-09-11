export type StorageSelector = string | Record<string, string>;

export interface HyperStorageOptions {
  localStorage?: {
    dbName?: string;
    /**
     * @default 'localStorage'
     */
    mode?: 'indexedDB' | 'localStorage';
    selectors: StorageSelector[];
  };
  url?: {
    /**
     * @default 'hash'
     */
    mode?: 'hash' | 'search';
    selectors: StorageSelector[];
  };
}
