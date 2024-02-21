interface KeyStore {
  index: number;
  keyLen: number;
  keys: string[];
}

class KeyManager {
  private _cache: Map<string, KeyStore> = new Map();

  private getKeyStore(apiKeys: string) {
    let store = this._cache.get(apiKeys);

    if (!store) {
      const keys = apiKeys.split(',');

      store = { index: 0, keyLen: keys.length, keys } as KeyStore;
      this._cache.set(apiKeys, store);
    }

    return store;
  }

  pick(apiKeys: string = '', mode: string = 'random') {
    if (!apiKeys) return '';

    const store = this.getKeyStore(apiKeys);
    let index = 0;

    if (mode === 'turn') index = store.index++ % store.keyLen;
    if (mode === 'random') index = Math.floor(Math.random() * store.keyLen);

    return store.keys[index];
  }
}

export default new KeyManager();
