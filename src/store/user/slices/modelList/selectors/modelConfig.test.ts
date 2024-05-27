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
  });

  describe('isProviderFetchOnClient', () => {
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

    it('client fetch should enabled if user set it enabled', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            azure: { fetchOnClient: true },
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
