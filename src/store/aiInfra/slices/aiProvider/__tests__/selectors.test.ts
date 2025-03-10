import { describe, expect, it } from 'vitest';

import { AiProviderDetailItem } from '@/types/aiProvider';

import { aiProviderSelectors } from '../selectors';

describe('aiProviderSelectors', () => {
  const mockState = {
    aiProviderList: [
      { id: 'provider1', enabled: true, sort: 1, source: 'builtin' as const },
      { id: 'provider2', enabled: false, sort: 2, source: 'builtin' as const },
      { id: 'provider3', enabled: true, sort: 0, source: 'builtin' as const },
    ],
    aiProviderLoadingIds: ['loading-provider'],
    aiProviderConfigUpdatingIds: ['updating-provider'],
    aiProviderDetail: {
      id: 'test-provider',
      enabled: true,
      name: 'Test Provider',
      source: 'builtin' as const,
      settings: {
        showApiKey: true,
        showChecker: true,
      },
      keyVaults: {
        apiKey: 'test-key',
        baseURL: 'test-url',
      },
    } as AiProviderDetailItem,
    activeAiProvider: 'provider1',
    aiProviderRuntimeConfig: {
      provider1: {
        keyVaults: {
          apiKey: 'key1',
          baseURL: 'url1',
        },
        settings: {
          searchMode: 'internal' as const,
        },
        fetchOnClient: true,
      },
      provider2: {
        keyVaults: {
          baseURL: 'url2',
        },
        settings: {
          searchMode: 'params' as const,
        },
      },
      ollama: {
        keyVaults: {},
        settings: {},
        fetchOnClient: true,
      },
    },
    activeProviderModelList: [],
    initAiProviderList: true,
    providerSearchKeyword: '',
    aiModelLoadingIds: [],
    aiModelMap: {},
    activeAiModel: '',
    initAiModelList: [],
    aiProviderModelList: [],
    builtinAiModelList: [],
    modelSearchKeyword: '',
  };

  describe('enabledAiProviderList', () => {
    it('should return sorted enabled providers', () => {
      const result = aiProviderSelectors.enabledAiProviderList(mockState);
      expect(result).toEqual([
        { id: 'provider3', enabled: true, sort: 0, source: 'builtin' },
        { id: 'provider1', enabled: true, sort: 1, source: 'builtin' },
      ]);
    });
  });

  describe('disabledAiProviderList', () => {
    it('should return disabled providers', () => {
      const result = aiProviderSelectors.disabledAiProviderList(mockState);
      expect(result).toEqual([{ id: 'provider2', enabled: false, sort: 2, source: 'builtin' }]);
    });
  });

  describe('isProviderEnabled', () => {
    it('should return true for enabled provider', () => {
      expect(aiProviderSelectors.isProviderEnabled('provider1')(mockState)).toBe(true);
    });

    it('should return false for disabled provider', () => {
      expect(aiProviderSelectors.isProviderEnabled('provider2')(mockState)).toBe(false);
    });
  });

  describe('isProviderLoading', () => {
    it('should return true for loading provider', () => {
      expect(aiProviderSelectors.isProviderLoading('loading-provider')(mockState)).toBe(true);
    });

    it('should return false for non-loading provider', () => {
      expect(aiProviderSelectors.isProviderLoading('provider1')(mockState)).toBe(false);
    });
  });

  describe('activeProviderConfig', () => {
    it('should return active provider config', () => {
      expect(aiProviderSelectors.activeProviderConfig(mockState)).toEqual(
        mockState.aiProviderDetail,
      );
    });
  });

  describe('isAiProviderConfigLoading', () => {
    it('should return true when provider id does not match active provider', () => {
      expect(aiProviderSelectors.isAiProviderConfigLoading('provider2')(mockState)).toBe(true);
    });

    it('should return false when provider id matches active provider', () => {
      expect(aiProviderSelectors.isAiProviderConfigLoading('provider1')(mockState)).toBe(false);
    });
  });

  describe('isActiveProviderEndpointNotEmpty', () => {
    it('should return true when baseURL exists', () => {
      expect(aiProviderSelectors.isActiveProviderEndpointNotEmpty(mockState)).toBe(true);
    });

    it('should return false when no endpoint info exists', () => {
      const state = {
        ...mockState,
        aiProviderDetail: {
          ...mockState.aiProviderDetail,
          keyVaults: {},
        },
      };
      expect(aiProviderSelectors.isActiveProviderEndpointNotEmpty(state)).toBe(false);
    });
  });

  describe('isActiveProviderApiKeyNotEmpty', () => {
    it('should return true when apiKey exists', () => {
      expect(aiProviderSelectors.isActiveProviderApiKeyNotEmpty(mockState)).toBe(true);
    });

    it('should return true when accessKeyId and secretAccessKey exist', () => {
      const state = {
        ...mockState,
        aiProviderDetail: {
          ...mockState.aiProviderDetail,
          keyVaults: {
            accessKeyId: 'id',
            secretAccessKey: 'secret',
          },
        },
      };
      expect(aiProviderSelectors.isActiveProviderApiKeyNotEmpty(state)).toBe(true);
    });

    it('should return false when no key info exists', () => {
      const state = {
        ...mockState,
        aiProviderDetail: {
          ...mockState.aiProviderDetail,
          keyVaults: {},
        },
      };
      expect(aiProviderSelectors.isActiveProviderApiKeyNotEmpty(state)).toBe(false);
    });
  });

  describe('providerConfigById', () => {
    it('should return config for existing provider', () => {
      expect(aiProviderSelectors.providerConfigById('provider1')(mockState)).toEqual({
        keyVaults: {
          apiKey: 'key1',
          baseURL: 'url1',
        },
        settings: {
          searchMode: 'internal',
        },
        fetchOnClient: true,
      });
    });

    it('should return undefined for non-existing provider', () => {
      expect(aiProviderSelectors.providerConfigById('non-existing')(mockState)).toBeUndefined();
    });

    it('should return undefined for empty id', () => {
      expect(aiProviderSelectors.providerConfigById('')(mockState)).toBeUndefined();
    });
  });

  describe('isProviderConfigUpdating', () => {
    it('should return true for updating provider', () => {
      expect(aiProviderSelectors.isProviderConfigUpdating('updating-provider')(mockState)).toBe(
        true,
      );
    });

    it('should return false for non-updating provider', () => {
      expect(aiProviderSelectors.isProviderConfigUpdating('provider1')(mockState)).toBe(false);
    });
  });

  describe('isProviderFetchOnClient', () => {
    it('should return true for whitelisted provider with fetchOnClient true', () => {
      expect(aiProviderSelectors.isProviderFetchOnClient('ollama')(mockState)).toBe(true);
    });

    it('should return true when only baseURL exists', () => {
      expect(aiProviderSelectors.isProviderFetchOnClient('provider2')(mockState)).toBe(true);
    });

    it('should return false when no endpoint or key info exists', () => {
      const state = {
        ...mockState,
        aiProviderRuntimeConfig: {
          provider3: {
            keyVaults: {},
            settings: {},
          },
        },
      };
      expect(aiProviderSelectors.isProviderFetchOnClient('provider3')(state)).toBe(false);
    });

    it('should return configured value when both endpoint and key exist', () => {
      expect(aiProviderSelectors.isProviderFetchOnClient('provider1')(mockState)).toBe(true);
    });
  });

  describe('providerKeyVaults', () => {
    it('should return key vaults for existing provider', () => {
      expect(aiProviderSelectors.providerKeyVaults('provider1')(mockState)).toEqual({
        apiKey: 'key1',
        baseURL: 'url1',
      });
    });

    it('should return undefined for non-existing provider', () => {
      expect(aiProviderSelectors.providerKeyVaults('non-existing')(mockState)).toBeUndefined();
    });

    it('should return undefined for undefined provider', () => {
      expect(aiProviderSelectors.providerKeyVaults(undefined)(mockState)).toBeUndefined();
    });
  });

  describe('isProviderHasBuiltinSearch', () => {
    it('should return true when provider has search mode', () => {
      expect(aiProviderSelectors.isProviderHasBuiltinSearch('provider1')(mockState)).toBe(true);
    });

    it('should return false when provider has no search mode', () => {
      expect(aiProviderSelectors.isProviderHasBuiltinSearch('ollama')(mockState)).toBe(false);
    });
  });

  describe('isProviderHasBuiltinSearchConfig', () => {
    it('should return true when provider has external search mode', () => {
      expect(aiProviderSelectors.isProviderHasBuiltinSearchConfig('provider2')(mockState)).toBe(
        true,
      );
    });

    it('should return false when provider has internal search mode', () => {
      expect(aiProviderSelectors.isProviderHasBuiltinSearchConfig('provider1')(mockState)).toBe(
        false,
      );
    });

    it('should return false when provider has no search mode', () => {
      expect(aiProviderSelectors.isProviderHasBuiltinSearchConfig('ollama')(mockState)).toBe(false);
    });
  });
});
