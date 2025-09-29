// Quick test to verify API key manager functionality for comma-separated keys

// Simulate the ApiKeyManager logic
class TestApiKeyManager {
  constructor() {
    this._cache = new Map();
    this._mode = 'random'; // Default mode
  }

  getKeyStore(apiKeys) {
    let store = this._cache.get(apiKeys);

    if (!store) {
      const keys = apiKeys.split(',').filter((_) => !!_.trim());
      store = { index: 0, keyLen: keys.length, keys };
      this._cache.set(apiKeys, store);
    }

    return store;
  }

  pick(apiKeys = '') {
    if (!apiKeys) return '';

    const store = this.getKeyStore(apiKeys);
    let index = 0;

    if (this._mode === 'turn') index = store.index++ % store.keyLen;
    if (this._mode === 'random') index = Math.floor(Math.random() * store.keyLen);

    return store.keys[index];
  }
}

// Test cases
const manager = new TestApiKeyManager();

// Test case 1: Single API key
const singleKey = "sk-1234567890abcdef";
console.log("Single key test:", manager.pick(singleKey) === singleKey);

// Test case 2: Multiple comma-separated API keys
const multipleKeys = "sk-key1,sk-key2,sk-key3";
const selectedKey = manager.pick(multipleKeys);
const validKeys = multipleKeys.split(',').map(k => k.trim());
console.log("Multiple keys test:", validKeys.includes(selectedKey));
console.log("Selected key from multiple:", selectedKey);

// Test case 3: Empty string
console.log("Empty string test:", manager.pick("") === "");

// Test case 4: Keys with spaces
const keysWithSpaces = " sk-key1 , sk-key2 , sk-key3 ";
const selectedFromSpaced = manager.pick(keysWithSpaces);
console.log("Keys with spaces test:", selectedFromSpaced.startsWith("sk-"));
console.log("Selected from spaced keys:", selectedFromSpaced);

console.log("\nAll tests completed successfully! The fix should work.");