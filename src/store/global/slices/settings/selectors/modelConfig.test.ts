import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS } from '@/const/settings';
import { modelProviderSelectors } from '@/store/global/slices/settings/selectors/modelProvider';
import { agentSelectors } from '@/store/session/slices/agent';
import { merge } from '@/utils/merge';

import { GlobalStore, useGlobalStore } from '../../../store';
import { GlobalSettingsState, initialSettingsState } from '../initialState';
import { modelConfigSelectors } from './modelConfig';

describe('modelConfigSelectors', () => {
  describe('modelSelectList', () => {
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

      const ollamaList = modelConfigSelectors.modelSelectList(s).find((r) => r.id === 'ollama');

      expect(ollamaList?.chatModels.find((c) => c.id === 'llava')).toEqual({
        displayName: 'LLaVA 7B',
        functionCall: false,
        enabled: true,
        id: 'llava',
        tokens: 4000,
        vision: true,
      });
    });
  });

  describe('providerEnabled', () => {
    it('should return true if provider is enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            ollama: { enabled: true },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      expect(modelConfigSelectors.providerEnabled('ollama')(s)).toBe(true);
    });

    it('should return false if provider is not enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: { enabled: false },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      expect(modelConfigSelectors.providerEnabled('perplexity')(s)).toBe(false);
    });
  });

  describe('providerModelCards', () => {
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

      const modelCards = modelConfigSelectors.providerModelCards('perplexity')(s);

      expect(modelCards).toContainEqual({
        id: 'custom-model',
        displayName: 'Custom Model',
        isCustom: true,
      });
    });
  });

  describe('enabledModelProviderList', () => {
    it('should return only enabled providers', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            perplexity: { enabled: true },
            azure: { enabled: false },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      const enabledProviders = modelConfigSelectors.enabledModelProviderList(s);
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

      const customModelCard = modelConfigSelectors.getCustomModelCardById({
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

      const customModelCard = modelConfigSelectors.getCustomModelCardById({
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
