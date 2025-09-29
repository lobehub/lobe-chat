import { describe, expect, it, vi } from 'vitest';

import { getProviderAuthPayload } from './_auth';

// Mock the ApiKeyManager
vi.mock('@/server/modules/ModelRuntime/apiKeyManager', () => ({
  ApiKeyManager: class MockApiKeyManager {
    pick(apiKeys: string) {
      if (!apiKeys) return '';
      const keys = apiKeys.split(',').filter((key) => !!key.trim());
      return keys[0]?.trim() || ''; // Return first key for testing
    }
  },
}));

describe('getProviderAuthPayload - Multiple API Keys Support', () => {
  it('should handle single API key for default provider', () => {
    const keyVaults = {
      apiKey: 'sk-single-key-123',
      baseURL: 'https://api.example.com',
    };

    const result = getProviderAuthPayload('custom-provider', keyVaults as any);

    expect(result).toEqual({
      apiKey: 'sk-single-key-123',
      baseURL: 'https://api.example.com',
    });
  });

  it('should handle comma-separated API keys for default provider', () => {
    const keyVaults = {
      apiKey: 'sk-key1,sk-key2,sk-key3',
      baseURL: 'https://api.example.com',
    };

    const result = getProviderAuthPayload('custom-provider', keyVaults as any);

    expect(result).toEqual({
      apiKey: 'sk-key1', // Mock returns first key
      baseURL: 'https://api.example.com',
    });
  });

  it('should handle comma-separated API keys for Azure provider', () => {
    const keyVaults = {
      apiKey: 'key1,key2,key3',
      apiVersion: '2023-05-15',
      baseURL: 'https://my-resource.openai.azure.com',
    };

    const result = getProviderAuthPayload('azure', keyVaults as any);

    expect(result).toEqual({
      apiKey: 'key1', // Mock returns first key
      apiVersion: '2023-05-15',
      azureApiVersion: '2023-05-15',
      baseURL: 'https://my-resource.openai.azure.com',
    });
  });

  it('should handle comma-separated API keys for Cloudflare provider', () => {
    const keyVaults = {
      apiKey: 'cf-key1,cf-key2,cf-key3',
      baseURLOrAccountID: 'account-123',
    };

    const result = getProviderAuthPayload('cloudflare', keyVaults as any);

    expect(result).toEqual({
      apiKey: 'cf-key1', // Mock returns first key
      baseURLOrAccountID: 'account-123',
      cloudflareBaseURLOrAccountID: 'account-123',
    });
  });

  it('should handle empty API key', () => {
    const keyVaults = {
      apiKey: '',
      baseURL: 'https://api.example.com',
    };

    const result = getProviderAuthPayload('custom-provider', keyVaults as any);

    expect(result).toEqual({
      apiKey: '',
      baseURL: 'https://api.example.com',
    });
  });

  it('should handle undefined API key', () => {
    const keyVaults = {
      baseURL: 'https://api.example.com',
    };

    const result = getProviderAuthPayload('custom-provider', keyVaults as any);

    expect(result).toEqual({
      apiKey: '',
      baseURL: 'https://api.example.com',
    });
  });

  it('should handle Bedrock provider without affecting apiKey handling', () => {
    const keyVaults = {
      accessKeyId: 'AKIA123',
      secretAccessKey: 'secret123',
      region: 'us-east-1',
    };

    const result = getProviderAuthPayload('bedrock', keyVaults as any);

    expect(result.apiKey).toBe('secret123AKIA123');
    expect(result.region).toBe('us-east-1');
  });

  it('should handle Ollama provider without API key', () => {
    const keyVaults = {
      baseURL: 'http://localhost:11434',
    };

    const result = getProviderAuthPayload('ollama', keyVaults as any);

    expect(result).toEqual({
      baseURL: 'http://localhost:11434',
    });
  });
});