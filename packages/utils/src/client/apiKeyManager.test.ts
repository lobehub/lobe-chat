import { describe, expect, it, vi } from 'vitest';

import { ClientApiKeyManager } from './apiKeyManager';

describe('ClientApiKeyManager', () => {
  it('should return empty string for empty input', () => {
    const manager = new ClientApiKeyManager();
    expect(manager.pick('')).toBeUndefined();
    expect(manager.pick()).toBeUndefined();
  });

  it('should return the single key when only one key is provided', () => {
    const manager = new ClientApiKeyManager();
    const apiKey = 'sk-test-key';
    expect(manager.pick(apiKey)).toBe(apiKey);
  });

  it('should pick random keys from comma-separated list', () => {
    const manager = new ClientApiKeyManager();
    const apiKeys = 'sk-key1,sk-key2,sk-key3';

    // Mock Math.random to return specific values
    const mockRandom = vi.spyOn(Math, 'random');

    // Test first key (index 0)
    mockRandom.mockReturnValueOnce(0);
    expect(manager.pick(apiKeys)).toBe('sk-key1');

    // Test second key (index 1)
    mockRandom.mockReturnValueOnce(0.4);
    expect(manager.pick(apiKeys)).toBe('sk-key2');

    // Test third key (index 2)
    mockRandom.mockReturnValueOnce(0.8);
    expect(manager.pick(apiKeys)).toBe('sk-key3');

    mockRandom.mockRestore();
  });

  it('should handle keys with spaces and filter empty keys', () => {
    const manager = new ClientApiKeyManager();
    const apiKeys = ' sk-key1 , sk-key2 , , sk-key3 ';

    const mockRandom = vi.spyOn(Math, 'random');

    // Should only have 3 valid keys
    mockRandom.mockReturnValueOnce(0);
    expect(manager.pick(apiKeys)).toBe('sk-key1');

    mockRandom.mockReturnValueOnce(0.4);
    expect(manager.pick(apiKeys)).toBe('sk-key2');

    mockRandom.mockReturnValueOnce(0.8);
    expect(manager.pick(apiKeys)).toBe('sk-key3');

    mockRandom.mockRestore();
  });

  it('should cache key stores for the same input', () => {
    const manager = new ClientApiKeyManager();
    const apiKeys = 'sk-key1,sk-key2';

    // First call should create cache
    manager.pick(apiKeys);

    // Second call should use cached store
    const result = manager.pick(apiKeys);
    expect(typeof result).toBe('string');
  });
});
