import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS } from '@/const/settings';
import { agentSelectors } from '@/store/session/slices/agent';
import { merge } from '@/utils/merge';

import { GlobalStore, useGlobalStore } from '../../../store';
import { initialSettingsState } from '../initialState';
import { modelProviderSelectors } from './modelProvider';

describe('modelProviderSelectors', () => {
  describe('providerCard', () => {
    it('should return the correct ModelProviderCard when provider ID matches', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerCard('openai')(s);
      expect(result).not.toBeUndefined();
    });

    it('should return undefined when provider ID does not exist', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;
      const result = modelProviderSelectors.providerCard('nonExistingProvider')(s);
      expect(result).toBeUndefined();
    });
  });

  describe('defaultEnabledProviderModels', () => {
    it('should return enabled models for a given provider', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;

      const result = modelProviderSelectors.defaultEnabledProviderModels('openai')(s);
      expect(result).toEqual(['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gpt-4-vision-preview']);
    });

    it('should return undefined for a non-existing provider', () => {
      const s = merge(initialSettingsState, {}) as unknown as GlobalStore;

      const result = modelProviderSelectors.defaultEnabledProviderModels('nonExistingProvider')(s);
      expect(result).toBeUndefined();
    });
  });
  describe('CUSTOM_MODELS', () => {
    it('custom deletion, addition, and renaming of models', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {
          customModelName:
            '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-0125-preview=gpt-4-turbo,gpt-4-0125-preview=gpt-4-32k',
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerModelList(s).filter((r) => r.enabled);

      expect(result).toMatchSnapshot();
    });

    it('should work correct with gpt-4', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {
          customModelName:
            '-all,+gpt-3.5-turbo-1106,+gpt-3.5-turbo,+gpt-3.5-turbo-16k,+gpt-4,+gpt-4-32k,+gpt-4-1106-preview,+gpt-4-vision-preview',
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerModelList(s).filter((r) => r.enabled);

      expect(result[0].chatModels).toMatchSnapshot();
    });
    it.skip('duplicate naming model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {},
        settings: {
          languageModel: {
            openAI: {
              customModelName: 'gpt-4-0125-preview=gpt-4-turbo，gpt-4-0125-preview=gpt-4-32k',
            },
          },
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerModelList(s).filter((r) => r.enabled);

      expect(result[0].chatModels.find((s) => s.id === 'gpt-4-0125-preview')?.displayName).toEqual(
        'gpt-4-32k',
      );
    });

    it('should delete model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: { customModelName: '-gpt-4' },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerModelList(s).filter((r) => r.enabled);

      expect(result.find((r) => r.id === 'gpt-4')).toBeUndefined();
    });

    it.skip('show the hidden model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {},
        settings: {
          languageModel: {
            openAI: {
              customModelName: '+gpt-4-1106-preview',
            },
          },
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerModelList(s).filter((r) => r.enabled);

      expect(result[0].chatModels.find((o) => o.id === 'gpt-4-1106-preview')).toEqual({
        displayName: 'GPT-4 Turbo Preview (1106)',
        functionCall: true,
        id: 'gpt-4-1106-preview',
        tokens: 128000,
      });
    });

    it.skip('only add the model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {},
        settings: {
          languageModel: {
            openAI: {
              customModelName: 'model1,model2,model3，model4',
            },
          },
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerModelList(s).filter((r) => r.enabled);

      expect(result[0].chatModels).toContainEqual({
        displayName: 'model1',
        functionCall: true,
        id: 'model1',
        isCustom: true,
        vision: true,
      });
      expect(result[0].chatModels).toContainEqual({
        displayName: 'model2',
        functionCall: true,
        id: 'model2',
        isCustom: true,
        vision: true,
      });
      expect(result[0].chatModels).toContainEqual({
        displayName: 'model3',
        functionCall: true,
        id: 'model3',
        isCustom: true,
        vision: true,
      });
      expect(result[0].chatModels).toContainEqual({
        displayName: 'model4',
        functionCall: true,
        id: 'model4',
        isCustom: true,
        vision: true,
      });
    });
  });

  describe('OPENROUTER_CUSTOM_MODELS', () => {
    it.skip('custom deletion, addition, and renaming of models', () => {
      const s = merge(initialSettingsState, {
        settings: {
          languageModel: {
            openrouter: {
              enabled: true,
            },
          },
        },
        serverConfig: {
          languageModel: {
            openrouter: {
              apiKey: 'test-openrouter-api-key',
              customModelName:
                '-all,+google/gemma-7b-it,+mistralai/mistral-7b-instruct=Mistral-7B-Instruct',
            },
          },
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.providerModelList(s).filter((r) => r.enabled);
      expect(result).toMatchSnapshot();
    });
  });

  describe('modelEnabledVision', () => {
    it('should return true if the model has vision ability', () => {
      const hasAbility = modelProviderSelectors.modelEnabledVision('gpt-4-vision-preview')(
        useGlobalStore.getState(),
      );
      expect(hasAbility).toBeTruthy();
    });

    it('should return false if the model does not have vision ability', () => {
      const hasAbility = modelProviderSelectors.modelEnabledVision('some-other-model')(
        useGlobalStore.getState(),
      );

      expect(hasAbility).toBeFalsy();
    });

    it('should return false if the model include vision in id', () => {
      const hasAbility = modelProviderSelectors.modelEnabledVision('some-other-model-vision')(
        useGlobalStore.getState(),
      );

      expect(hasAbility).toBeTruthy();
    });
  });

  describe('modelEnabledFiles', () => {
    it('should return false if the model does not have file ability', () => {
      const enabledFiles = modelProviderSelectors.modelEnabledFiles('gpt-4-vision-preview')(
        useGlobalStore.getState(),
      );
      expect(enabledFiles).toBeFalsy();
    });

    it('should return true if the model has file ability', () => {
      const enabledFiles = modelProviderSelectors.modelEnabledFiles('gpt-4-all')(
        useGlobalStore.getState(),
      );
      expect(enabledFiles).toBeTruthy();
    });
  });

  describe('modelHasMaxToken', () => {
    it('should return true if the model is in the list of models that show tokens', () => {
      const show = modelProviderSelectors.modelHasMaxToken('gpt-3.5-turbo')(
        useGlobalStore.getState(),
      );
      expect(show).toBeTruthy();
    });

    it('should return false if the model is not in the list of models that show tokens', () => {
      const show = modelProviderSelectors.modelHasMaxToken('some-other-model')(
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
