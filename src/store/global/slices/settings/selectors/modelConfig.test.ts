import { describe, expect, it } from 'vitest';

import { merge } from '@/utils/merge';

import { GlobalStore, useGlobalStore } from '../../../store';
import { GlobalSettingsState, initialSettingsState } from '../initialState';
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
