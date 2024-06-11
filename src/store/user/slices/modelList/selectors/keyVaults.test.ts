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

    describe('AWSBedrockKeyVault', () => {
      it('should return true if provider endpoint is not empty for AWSBedrockKeyVault', () => {
        const s = merge(initialSettingsState, {
          settings: {
            keyVaults: {
              bedrock: {
                region: 'region',
              } as AWSBedrockKeyVault,
            },
          },
        }) as unknown as UserStore;
        expect(keyVaultsConfigSelectors.isProviderEndpointNotEmpty('bedrock')(s)).toBe(true);
      });

      it('should return false if provider endpoint is empty for AWSBedrockKeyVault', () => {
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
});
