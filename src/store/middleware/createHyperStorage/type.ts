export type StorageSelector = string | Record<string, string>;

export interface LocalStorageOptions {
  dbName?: string;
  /**
   * @default 'localStorage'
   */
  mode?: "indexedDB" | "localStorage";
  selectors: StorageSelector[];
}

/**
 * 超级存储选项配置
 * @author dongjak
 * @created 2023/12/30
 * @version 1.0
 * @since 1.0
 */
export interface HyperStorageOptions {
  // 本地存储配置
  localStorage?: LocalStorageOptions | false;
  url?: {
    /**
     * @default 'hash'
     */
    mode?: "hash" | "search";
    selectors: StorageSelector[];
  };
}
