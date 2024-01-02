export type StorageSelector = string | Record<string, string>;

export interface LocalStorageOptions {
  dbName?: string;
  /**
   * @default 'localStorage'
   */
  mode?: 'indexedDB' | 'localStorage';
  selectors: StorageSelector[];
}

export type HyperStorageOptionsObj = {
  localStorage?: LocalStorageOptions | false;
  url?: {
    /**
     * @default 'hash'
     */
    mode?: 'hash' | 'search';
    selectors: StorageSelector[];
  };
};

export type HyperStorageOptionsFn = () => HyperStorageOptionsObj;

export type HyperStorageOptions = HyperStorageOptionsObj | HyperStorageOptionsFn;
