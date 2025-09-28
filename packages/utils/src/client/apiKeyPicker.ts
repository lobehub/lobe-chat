interface KeyStore {
  index: number;
  keyLen: number;
  keys: string[];
}

export type ApiKeySelectMode = 'random' | 'turn';

export class ClientApiKeyManager {
  private _cache: Record<string, KeyStore> = {};
  private _mode: ApiKeySelectMode;

  constructor(mode: ApiKeySelectMode = 'random') {
    this._mode = mode;
  }

  private getKeyStore(apiKeys: string) {
    let store = this._cache[apiKeys];

    if (!store) {
      const keys = apiKeys.split(',').filter((_) => !!_.trim());

      store = { index: 0, keyLen: keys.length, keys } as KeyStore;
      this._cache[apiKeys] = store;
    }

    return store;
  }

  pick(apiKeys: string = ''): string {
    if (!apiKeys) return '';

    const store = this.getKeyStore(apiKeys);
    let index = 0;

    if (this._mode === 'turn') index = store.index++ % store.keyLen;
    if (this._mode === 'random') index = Math.floor(Math.random() * store.keyLen);

    return store.keys[index];
  }

  /**
   * Get the number of keys for a given API key string
   */
  getKeyCount(apiKeys: string = ''): number {
    if (!apiKeys) return 0;
    return this.getKeyStore(apiKeys).keyLen;
  }

  /**
   * Validate if the API key string has multiple keys
   */
  hasMultipleKeys(apiKeys: string = ''): boolean {
    return this.getKeyCount(apiKeys) > 1;
  }
}

// Default instance with random selection
export const clientApiKeyPicker = new ClientApiKeyManager('random');

/**
 * Pick a random API key from comma-separated keys
 * @param apiKeys - Comma-separated API keys string
 * @returns A single API key selected randomly
 */
export const pickApiKey = (apiKeys: string = ''): string => {
  return clientApiKeyPicker.pick(apiKeys);
};

/**
 * Check if API keys string contains multiple keys
 * @param apiKeys - Comma-separated API keys string
 * @returns True if multiple keys are present
 */
export const hasMultipleApiKeys = (apiKeys: string = ''): boolean => {
  return clientApiKeyPicker.hasMultipleKeys(apiKeys);
};

/**
 * Get the count of API keys in a string
 * @param apiKeys - Comma-separated API keys string
 * @returns Number of keys
 */
export const getApiKeyCount = (apiKeys: string = ''): number => {
  return clientApiKeyPicker.getKeyCount(apiKeys);
};