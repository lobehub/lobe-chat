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
  it('should return true when provider has disableBrowserRequest set to true', () => {
    const mockProvider: ModelProviderCard = {
      id: 'test-provider',
      name: 'Test Provider',
      url: 'https://test.com',
      settings: {},
      chatModels: [],
      disableBrowserRequest: true,
    };

    DEFAULT_MODEL_PROVIDER_LIST.push(mockProvider);
    expect(isProviderDisableBroswerRequest('test-provider')).toBe(true);
  });

  it('should return false when provider has disableBrowserRequest set to false', () => {
    const mockProvider: ModelProviderCard = {
      id: 'test-provider-2',
      name: 'Test Provider 2',
      url: 'https://test.com',
      settings: {},
      chatModels: [],
      disableBrowserRequest: false,
    };

    DEFAULT_MODEL_PROVIDER_LIST.push(mockProvider);
    expect(isProviderDisableBroswerRequest('test-provider-2')).toBe(false);
  });

  it('should return false when provider is not found', () => {
    expect(isProviderDisableBroswerRequest('non-existent-provider')).toBe(false);
  });

  it('should return false when provider has no disableBrowserRequest property', () => {
    const mockProvider: ModelProviderCard = {
      id: 'test-provider-3',
      name: 'Test Provider 3',
      url: 'https://test.com',
      settings: {},
      chatModels: [],
    };

    DEFAULT_MODEL_PROVIDER_LIST.push(mockProvider);
    expect(isProviderDisableBroswerRequest('test-provider-3')).toBe(false);
  });
});
