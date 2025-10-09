/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */

/**
 * EdgeConfig 完整配置类型
 */
export interface EdgeConfigData {
  /**
   * Assistant blacklist
   */
  assistant_blacklist?: string[];
  /**
   * Assistant whitelist
   */
  assistant_whitelist?: string[];

  /**
   * Feature flags configuration
   */
  feature_flags?: Record<string, boolean | string[]>;
}

export type EdgeConfigKeys = keyof EdgeConfigData;
