import { describe, expect, it } from 'vitest';

import { merge } from '@/utils/merge';

import { GlobalStore, useGlobalStore } from '../../../store';
import { GlobalSettingsState, initialSettingsState } from '../initialState';
import { modelConfigSelectors } from './modelConfig';

describe('modelConfigSelectors', () => {
  describe('providerListWithConfig', () => {
    it('visible', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            ollama: {
              enabledModels: ['llava'],
            },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      const ollamaList = modelConfigSelectors
        .providerListWithConfig(s)
        .find((r) => r.id === 'ollama');

      expect(ollamaList?.chatModels.find((c) => c.id === 'llava')).toEqual({
        displayName: 'LLaVA 7B',
        functionCall: false,
        enabled: true,
        id: 'llava',
        tokens: 4000,
        vision: true,
      });
    });
    it('with user custom models', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: {
              customModelCards: [{ id: 'sonar-online', displayName: 'Sonar Online' }],
            },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      const providerList = modelConfigSelectors
        .providerListWithConfig(s)
        .find((r) => r.id === 'perplexity');

      expect(providerList?.chatModels.find((c) => c.id === 'sonar-online')).toEqual({
        id: 'sonar-online',
        displayName: 'Sonar Online',
        enabled: false,
        isCustom: true,
      });
    });
  });

  describe('isProviderEnabled', () => {
    it('should return true if provider is enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            ollama: { enabled: true },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      expect(modelConfigSelectors.isProviderEnabled('ollama')(s)).toBe(true);
    });

    it('should return false if provider is not enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: { enabled: false },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      expect(modelConfigSelectors.isProviderEnabled('perplexity')(s)).toBe(false);
    });
  });

  describe('getModelCardsByProviderId', () => {
    it('should return model cards including custom model cards', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: {
              customModelCards: [{ id: 'custom-model', displayName: 'Custom Model' }],
            },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      const modelCards = modelConfigSelectors.getModelCardsByProviderId('perplexity')(s);

      expect(modelCards).toContainEqual({
        id: 'custom-model',
        displayName: 'Custom Model',
        isCustom: true,
      });
    });
  });

  describe('providerListForModelSelect', () => {
    it('should return only enabled providers', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: { enabled: true },
            azure: { enabled: false },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      const enabledProviders = modelConfigSelectors.providerListForModelSelect(s);
      expect(enabledProviders).toHaveLength(2);
      expect(enabledProviders[1].id).toBe('perplexity');
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
      } as GlobalSettingsState) as unknown as GlobalStore;

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
      } as GlobalSettingsState) as unknown as GlobalStore;

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
      } as GlobalSettingsState) as unknown as GlobalStore;

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
      } as GlobalSettingsState) as unknown as GlobalStore;

      const currentEditingModelCard = modelConfigSelectors.currentEditingCustomModelCard(s);

      expect(currentEditingModelCard).toBeUndefined();
    });
  });
});
