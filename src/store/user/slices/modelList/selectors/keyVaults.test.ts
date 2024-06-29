import { describe, expect, it } from 'vitest';

import { UserStore } from '@/store/user';
import {
  AWSBedrockKeyVault,
  AzureOpenAIKeyVault,
  OpenAICompatibleKeyVault,
} from '@/types/user/settings';
import { merge } from '@/utils/merge';

import { initialSettingsState } from '../../settings/initialState';
import { keyVaultsConfigSelectors } from './keyVaults';

describe('keyVaultsConfigSelectors', () => {
  describe('isProviderEndpointNotEmpty', () => {
    describe('OpenAICompatibleKeyVault', () => {
      it('should return true if provider endpoint is not empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              openai: {
                endpoint: 'endpoint',
              } as OpenAICompatibleKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderEndpointNotEmpty('openai')(s)).toBe(true);
      });

      it('should return false if provider endpoint is empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              openai: {
                endpoint: undefined,
              } as OpenAICompatibleKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderEndpointNotEmpty('openai')(s)).toBe(false);
      });
    });

    describe('AzureOpenAIKeyVault', () => {
      it('should return true if provider endpoint is not empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              azure: {
                baseURL: 'baseURL',
              } as AzureOpenAIKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderEndpointNotEmpty('azure')(s)).toBe(true);
      });

      it('should return false if provider endpoint is empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              azure: {
                baseURL: undefined,
              } as AzureOpenAIKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderEndpointNotEmpty('azure')(s)).toBe(false);
      });
    });

    // Always return false for AWSBedrockKeyVault
    describe('AWSBedrockKeyVault', () => {
      it('should return false if provider region is not empty for AWSBedrockKeyVault', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              bedrock: {
                region: 'region',
              } as AWSBedrockKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderEndpointNotEmpty('bedrock')(s)).toBe(false);
      });

      it('should return false if provider region is empty for AWSBedrockKeyVault', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              bedrock: {
                region: undefined,
              } as AWSBedrockKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderEndpointNotEmpty('bedrock')(s)).toBe(false);
      });
    });
  });

  describe('isProviderApiKeyNotEmpty', () => {
    describe('OpenAICompatibleKeyVault', () => {
      it('should return true if provider apikey is not empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              openai: {
                apiKey: 'apikey',
              } as OpenAICompatibleKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderApiKeyNotEmpty('openai')(s)).toBe(true);
      });

      it('should return false if provider apikey is empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              openai: {
                apiKey: undefined,
              } as OpenAICompatibleKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderApiKeyNotEmpty('openai')(s)).toBe(false);
      });
    });

    describe('AzureOpenAIKeyVault', () => {
      it('should return true if provider apikey is not empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              azure: {
                apiKey: 'apikey',
              } as AzureOpenAIKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderApiKeyNotEmpty('azure')(s)).toBe(true);
      });

      it('should return false if provider apikey is empty', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              azure: {
                apiKey: undefined,
              } as AzureOpenAIKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderApiKeyNotEmpty('azure')(s)).toBe(false);
      });
    });

    describe('AWSBedrockKeyVault', () => {
      it('should return true if provider accessKeyId is not empty for AWSBedrockKeyVault', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              bedrock: {
                accessKeyId: 'accessKeyId',
              } as AWSBedrockKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderApiKeyNotEmpty('bedrock')(s)).toBe(true);
      });

      it('should return true if provider secretAccessKey is not empty for AWSBedrockKeyVault', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              bedrock: {
                secretAccessKey: 'secretAccessKey',
              } as AWSBedrockKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderApiKeyNotEmpty('bedrock')(s)).toBe(true);
      });

      it('should return false if provider accessKeyId and secretAccessKey are both empty for AWSBedrockKeyVault', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              bedrock: {
                accessKeyId: undefined,
                secretAccessKey: undefined,
              } as AWSBedrockKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderApiKeyNotEmpty('bedrock')(s)).toBe(false);
      });
    });
  });
});
