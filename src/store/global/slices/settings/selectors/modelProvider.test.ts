import { describe, expect, it } from 'vitest';

import { merge } from '@/utils/merge';

import { GlobalStore, useGlobalStore } from '../../../store';
import { GlobalSettingsState, initialSettingsState } from '../initialState';
import { getDefaultModeProviderById, modelProviderSelectors } from './modelProvider';

describe('modelProviderSelectors', () => {
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

      const ollamaList = modelProviderSelectors.modelProviderList(s).find((r) => r.id === 'ollama');

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

      const providerList = modelProviderSelectors
        .modelProviderList(s)
        .find((r) => r.id === 'perplexity');

      expect(providerList?.chatModels.find((c) => c.id === 'sonar-online')).toEqual({
        id: 'sonar-online',
        displayName: 'Sonar Online',
        enabled: false,
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

      const enabledProviders = modelProviderSelectors.modelProviderListForModelSelect(s);
      expect(enabledProviders).toHaveLength(2);
      expect(enabledProviders[1].id).toBe('perplexity');
    });
  });

  describe('providerCard', () => {
    it('should return the correct ModelProviderCard when provider ID matches', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;

      const result = getDefaultModeProviderById('openai')(s);
      expect(result).not.toBeUndefined();
    });

    it('should return undefined when provider ID does not exist', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;
      const result = getDefaultModeProviderById('nonExistingProvider')(s);
      expect(result).toBeUndefined();
    });
  });

  describe('getModelCardsById', () => {
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

      const modelCards = modelProviderSelectors.getModelCardsById('perplexity')(s);

      expect(modelCards).toContainEqual({
        id: 'custom-model',
        displayName: 'Custom Model',
        isCustom: true,
      });
    });
  });

  describe('defaultEnabledProviderModels', () => {
    it('should return enabled models for a given provider', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;

      const result = modelProviderSelectors.getDefaultEnabledModelsById('openai')(s);
      expect(result).toEqual(['gpt-3.5-turbo', 'gpt-4-turbo']);
    });

    it('should return undefined for a non-existing provider', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;

      const result = modelProviderSelectors.getDefaultEnabledModelsById('nonExistingProvider')(s);
      expect(result).toBeUndefined();
    });
  });
  describe('modelEnabledVision', () => {
    it('should return true if the model has vision ability', () => {
      const hasAbility = modelProviderSelectors.isModelEnabledVision('gpt-4-vision-preview')(
        useGlobalStore.getState(),
      );
      expect(hasAbility).toBeTruthy();
    });

    it('should return false if the model does not have vision ability', () => {
      const hasAbility = modelProviderSelectors.isModelEnabledVision('some-other-model')(
        useGlobalStore.getState(),
      );

      expect(hasAbility).toBeFalsy();
    });

    it('should return false if the model include vision in id', () => {
      const hasAbility = modelProviderSelectors.isModelEnabledVision('some-other-model-vision')(
        useGlobalStore.getState(),
      );

      expect(hasAbility).toBeTruthy();
    });
  });

  describe('modelEnabledFiles', () => {
    it('should return false if the model does not have file ability', () => {
      const enabledFiles = modelProviderSelectors.isModelEnabledFiles('gpt-4-vision-preview')(
        useGlobalStore.getState(),
      );
      expect(enabledFiles).toBeFalsy();
    });

    it('should return true if the model has file ability', () => {
      const enabledFiles = modelProviderSelectors.isModelEnabledFiles('gpt-4-all')(
        useGlobalStore.getState(),
      );
      expect(enabledFiles).toBeTruthy();
    });
  });

  describe('modelHasMaxToken', () => {
    it('should return true if the model is in the list of models that show tokens', () => {
      const show = modelProviderSelectors.isModelHasMaxToken('gpt-3.5-turbo')(
        useGlobalStore.getState(),
      );
      expect(show).toBeTruthy();
    });

    it('should return false if the model is not in the list of models that show tokens', () => {
      const show = modelProviderSelectors.isModelHasMaxToken('some-other-model')(
        useGlobalStore.getState(),
      );
      expect(show).toBe(false);
    });
  });

  describe('modelMaxToken', () => {
    it('should return the correct token count for a model with specified tokens', () => {
      const model1Tokens = modelProviderSelectors.modelMaxToken('gpt-3.5-turbo')(
        useGlobalStore.getState(),
      );

      expect(model1Tokens).toEqual(16385);
    });

    it('should return 0 for a model without a specified token count', () => {
      // 测试未指定tokens属性的模型的tokens值，期望为0
      const tokens = modelProviderSelectors.modelMaxToken('chat-bison-001')(
        useGlobalStore.getState(),
      );
      expect(tokens).toEqual(0);
    });

    it('should return 0 for a non-existing model', () => {
      // 测试一个不存在的模型的tokens值，期望为0
      const tokens = modelProviderSelectors.modelMaxToken('nonExistingModel')(
        useGlobalStore.getState(),
      );

      expect(tokens).toEqual(0);
    });
  });
});
