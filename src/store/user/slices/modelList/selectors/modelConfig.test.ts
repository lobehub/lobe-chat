import { describe, expect, it } from 'vitest';

import { UserStore } from '@/store/user';
import { merge } from '@/utils/merge';

import { UserState } from '../../../initialState';
import { UserSettingsState, initialSettingsState } from '../../settings/initialState';
import { modelConfigSelectors } from './modelConfig';

describe('modelConfigSelectors', () => {
  describe('isProviderEnabled', () => {
    it('should return true if provider is enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            ollama: { enabled: true },
          },
        },
      } as UserSettingsState) as unknown as UserStore;

      expect(modelConfigSelectors.isProviderEnabled('ollama')(s)).toBe(true);
    });

    it('should return false if provider is not enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: { enabled: false },
          },
        },
      } as UserSettingsState) as unknown as UserStore;

      expect(modelConfigSelectors.isProviderEnabled('perplexity')(s)).toBe(false);
    });

    it('should follow the user settings if provider is in the whitelist', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            ollama: { enabled: false },
          },
        },
      } as UserSettingsState) as unknown as UserStore;

      expect(modelConfigSelectors.isProviderEnabled('ollama')(s)).toBe(false);
    });

    it('ollama should be enabled by default', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {},
        },
      } as UserSettingsState) as unknown as UserStore;
      expect(modelConfigSelectors.isProviderEnabled('ollama')(s)).toBe(true);
    });
  });

  describe('isProviderFetchOnClient', () => {
    // The next 4 case are base on the rules on https://github.com/lobehub/lobe-chat/pull/2753
    it('client fetch should disabled on default', () => {
      const s = merge(initialSettingsState, {
        settings: {
          keyVaults: {
            azure: {
              endpoint: 'endpoint',
              apiKey: 'apikey',
            },
          },
        },
      } as UserSettingsState) as unknown as UserStore;
      expect(modelConfigSelectors.isProviderFetchOnClient('azure')(s)).toBe(false);
    });

    it('client fetch should disabled if no apikey or endpoint provided even user set it enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            azure: { fetchOnClient: true },
          },
        },
      } as UserSettingsState) as unknown as UserStore;
      expect(modelConfigSelectors.isProviderFetchOnClient('azure')(s)).toBe(false);
    });

    it('client fetch should enable if only endpoint provided', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            azure: { fetchOnClient: false },
          },
          keyVaults: {
            azure: { endpoint: 'https://example.com' },
          },
        },
      } as UserSettingsState) as unknown as UserStore;
      expect(modelConfigSelectors.isProviderFetchOnClient('azure')(s)).toBe(true);
    });

    it('client fetch should control by user when a apikey or endpoint provided', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            azure: { fetchOnClient: true },
          },
          keyVaults: {
            azure: { apiKey: 'some-key' },
          },
        },
      } as UserSettingsState) as unknown as UserStore;
      expect(modelConfigSelectors.isProviderFetchOnClient('azure')(s)).toBe(true);
    });
  });

  describe('getCustomModelCardById', () => {
    it('should return the custom model card with the given id and provider', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: {
              customModelCards: [
                { id: 'custom-model-1', displayName: 'Custom Model 1' },
                { id: 'custom-model-2', displayName: 'Custom Model 2' },
              ],
            },
          },
        },
      } as UserSettingsState) as unknown as UserStore;

      const customModelCard = modelConfigSelectors.getCustomModelCard({
        id: 'custom-model-2',
        provider: 'perplexity',
      })(s);

      expect(customModelCard).toEqual({ id: 'custom-model-2', displayName: 'Custom Model 2' });
    });

    it('should return undefined if no custom model card is found with the given id and provider', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: {
              customModelCards: [{ id: 'custom-model-1', displayName: 'Custom Model 1' }],
            },
          },
        },
      } as UserSettingsState) as unknown as UserStore;

      const customModelCard = modelConfigSelectors.getCustomModelCard({
        id: 'nonexistent-model',
        provider: 'perplexity',
      })(s);

      expect(customModelCard).toBeUndefined();
    });
  });

  describe('currentEditingCustomModelCard', () => {
    it('should return the custom model card that is currently being edited', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: {
              customModelCards: [
                { id: 'custom-model-1', displayName: 'Custom Model 1' },
                { id: 'custom-model-2', displayName: 'Custom Model 2' },
              ],
            },
          },
        },
        editingCustomCardModel: {
          id: 'custom-model-2',
          provider: 'perplexity',
        },
      } as UserState) as unknown as UserStore;

      const currentEditingModelCard = modelConfigSelectors.currentEditingCustomModelCard(s);

      expect(currentEditingModelCard).toEqual({
        id: 'custom-model-2',
        displayName: 'Custom Model 2',
      });
    });

    it('should return undefined if no custom model card is currently being edited', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: {
              customModelCards: [{ id: 'custom-model-1', displayName: 'Custom Model 1' }],
            },
          },
        },
      } as UserSettingsState) as unknown as UserStore;

      const currentEditingModelCard = modelConfigSelectors.currentEditingCustomModelCard(s);

      expect(currentEditingModelCard).toBeUndefined();
    });
  });
});
