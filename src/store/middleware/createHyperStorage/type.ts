export type StorageSelector = string | Record<string, string>;

export interface LocalStorageOptions {
  dbName?: string;
  /**
   * @default 'localStorage'
   */
  mode?: 'indexedDB' | 'localStorage';
  selectors: StorageSelector[];
}

export interface HyperStorageOptions {
  localStorage?: LocalStorageOptions | false;
  url?: {
    /**
     * @default 'hash'
     */
    mode?: 'hash' | 'search';
    selectors: StorageSelector[];
  };
}
