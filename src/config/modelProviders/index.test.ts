import { describe, expect, it } from 'vitest';

import { ModelProviderCard } from '@/types/llm';

import {
  DEFAULT_MODEL_PROVIDER_LIST,
  filterEnabledModels,
  isProviderDisableBroswerRequest,
} from './index';

describe('filterEnabledModels', () => {
  it('should filter enabled models and return their IDs', () => {
    const provider: ModelProviderCard = {
      id: 'test-provider',
      name: 'Test Provider',
      url: 'https://test.com',
      settings: {},
      chatModels: [
        { id: 'model1', enabled: true },
        { id: 'model2', enabled: false },
        { id: 'model3', enabled: true },
        { id: 'model4' }, // undefined enabled should be treated as false
      ],
    };

    const result = filterEnabledModels(provider);
    expect(result).toEqual(['model1', 'model3']);
  });

  it('should return empty array when no models are enabled', () => {
    const provider: ModelProviderCard = {
      id: 'test-provider',
      name: 'Test Provider',
      url: 'https://test.com',
      settings: {},
      chatModels: [
        { id: 'model1', enabled: false },
        { id: 'model2', enabled: false },
        { id: 'model3' },
      ],
    };

    const result = filterEnabledModels(provider);
    expect(result).toEqual([]);
  });

  it('should return empty array when chatModels is empty', () => {
    const provider: ModelProviderCard = {
      id: 'test-provider',
      name: 'Test Provider',
      url: 'https://test.com',
      settings: {},
      chatModels: [],
    };

    const result = filterEnabledModels(provider);
    expect(result).toEqual([]);
  });
});

describe('isProviderDisableBroswerRequest', () => {
  it('should return true if provider exists and has disableBrowserRequest set to true', () => {
    const testProvider: ModelProviderCard = {
      id: 'test-provider',
      name: 'Test Provider',
      url: 'https://test.com',
      settings: {},
      chatModels: [],
      disableBrowserRequest: true,
    };

    // Add test provider to the list temporarily for testing
    DEFAULT_MODEL_PROVIDER_LIST.push(testProvider);
    expect(isProviderDisableBroswerRequest('test-provider')).toBe(true);
    // Remove test provider to not affect other tests
    DEFAULT_MODEL_PROVIDER_LIST.pop();
  });

  it('should return false if provider exists but disableBrowserRequest is false', () => {
    const testProvider: ModelProviderCard = {
      id: 'test-provider',
      name: 'Test Provider',
      url: 'https://test.com',
      settings: {},
      chatModels: [],
      disableBrowserRequest: false,
    };

    DEFAULT_MODEL_PROVIDER_LIST.push(testProvider);
    expect(isProviderDisableBroswerRequest('test-provider')).toBe(false);
    DEFAULT_MODEL_PROVIDER_LIST.pop();
  });

  it('should return false if provider exists but disableBrowserRequest is not set', () => {
    const testProvider: ModelProviderCard = {
      id: 'test-provider',
      name: 'Test Provider',
      url: 'https://test.com',
      settings: {},
      chatModels: [],
    };

    DEFAULT_MODEL_PROVIDER_LIST.push(testProvider);
    expect(isProviderDisableBroswerRequest('test-provider')).toBe(false);
    DEFAULT_MODEL_PROVIDER_LIST.pop();
  });

  it('should return false if provider does not exist', () => {
    expect(isProviderDisableBroswerRequest('non-existent-provider')).toBe(false);
  });
});
