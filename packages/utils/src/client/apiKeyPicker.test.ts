import { describe, expect, it } from 'vitest';

import { ClientApiKeyManager, getApiKeyCount, hasMultipleApiKeys, pickApiKey } from './apiKeyPicker';

describe('ClientApiKeyManager', () => {
  describe('pick method', () => {
    it('should return empty string for empty input', () => {
      const manager = new ClientApiKeyManager('random');
      expect(manager.pick('')).toBe('');
      expect(manager.pick()).toBe('');
    });

    it('should return the single key for single key input', () => {
      const manager = new ClientApiKeyManager('random');
      const singleKey = 'sk-1234567890abcdef';
      expect(manager.pick(singleKey)).toBe(singleKey);
    });

    it('should return one of the keys for comma-separated input', () => {
      const manager = new ClientApiKeyManager('random');
      const keys = 'sk-key1,sk-key2,sk-key3';
      const result = manager.pick(keys);
      expect(['sk-key1', 'sk-key2', 'sk-key3']).toContain(result);
    });

    it('should handle keys with whitespace', () => {
      const manager = new ClientApiKeyManager('random');
      const keys = ' sk-key1 , sk-key2 , sk-key3 ';
      const result = manager.pick(keys);
      expect(['sk-key1', 'sk-key2', 'sk-key3']).toContain(result);
    });

    it('should use turn mode correctly', () => {
      const manager = new ClientApiKeyManager('turn');
      const keys = 'key1,key2,key3';
      
      const results = [];
      for (let i = 0; i < 6; i++) {
        results.push(manager.pick(keys));
      }
      
      // In turn mode, should cycle through keys
      expect(results).toEqual(['key1', 'key2', 'key3', 'key1', 'key2', 'key3']);
    });
  });

  describe('getKeyCount method', () => {
    it('should return 0 for empty input', () => {
      const manager = new ClientApiKeyManager();
      expect(manager.getKeyCount('')).toBe(0);
      expect(manager.getKeyCount()).toBe(0);
    });

    it('should return 1 for single key', () => {
      const manager = new ClientApiKeyManager();
      expect(manager.getKeyCount('sk-123')).toBe(1);
    });

    it('should return correct count for multiple keys', () => {
      const manager = new ClientApiKeyManager();
      expect(manager.getKeyCount('key1,key2,key3')).toBe(3);
      expect(manager.getKeyCount('key1,key2,key3,key4,key5')).toBe(5);
    });
  });

  describe('hasMultipleKeys method', () => {
    it('should return false for empty or single key', () => {
      const manager = new ClientApiKeyManager();
      expect(manager.hasMultipleKeys('')).toBe(false);
      expect(manager.hasMultipleKeys('sk-123')).toBe(false);
    });

    it('should return true for multiple keys', () => {
      const manager = new ClientApiKeyManager();
      expect(manager.hasMultipleKeys('key1,key2')).toBe(true);
      expect(manager.hasMultipleKeys('key1,key2,key3')).toBe(true);
    });
  });
});

describe('utility functions', () => {
  describe('pickApiKey', () => {
    it('should work with default random manager', () => {
      expect(pickApiKey('')).toBe('');
      expect(pickApiKey('sk-123')).toBe('sk-123');
      
      const keys = 'key1,key2,key3';
      const result = pickApiKey(keys);
      expect(['key1', 'key2', 'key3']).toContain(result);
    });
  });

  describe('hasMultipleApiKeys', () => {
    it('should detect multiple keys correctly', () => {
      expect(hasMultipleApiKeys('')).toBe(false);
      expect(hasMultipleApiKeys('sk-123')).toBe(false);
      expect(hasMultipleApiKeys('key1,key2')).toBe(true);
    });
  });

  describe('getApiKeyCount', () => {
    it('should count keys correctly', () => {
      expect(getApiKeyCount('')).toBe(0);
      expect(getApiKeyCount('sk-123')).toBe(1);
      expect(getApiKeyCount('key1,key2,key3')).toBe(3);
    });
  });
});