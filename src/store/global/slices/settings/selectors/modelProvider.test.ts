import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS } from '@/const/settings';
import { agentSelectors } from '@/store/session/slices/agent';
import { merge } from '@/utils/merge';

import { GlobalStore, useGlobalStore } from '../../../store';
import { initialSettingsState } from '../initialState';
import { modelProviderSelectors } from './modelProvider';

describe('modelProviderSelectors', () => {
  describe('CUSTOM_MODELS', () => {
    it('custom deletion, addition, and renaming of models', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {
          customModelName:
            '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-0125-preview=gpt-4-turbo,gpt-4-0125-preview=gpt-4-32k',
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result).toMatchSnapshot();
    });

    it('should work correct with gpt-4', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {
          customModelName:
            '-all,+gpt-3.5-turbo-1106,+gpt-3.5-turbo,+gpt-3.5-turbo-16k,+gpt-4,+gpt-4-32k,+gpt-4-1106-preview,+gpt-4-vision-preview',
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels).toEqual([
        {
          displayName: 'GPT-3.5 Turbo (1106)',
          functionCall: true,
          id: 'gpt-3.5-turbo-1106',
          tokens: 16385,
        },
        {
          description: 'GPT 3.5 Turbo，适用于各种文本生成和理解任务',
          displayName: 'GPT-3.5 Turbo',
          functionCall: true,
          id: 'gpt-3.5-turbo',
          tokens: 4096,
        },
        {
          displayName: 'GPT-3.5 Turbo 16K',
          id: 'gpt-3.5-turbo-16k',
          tokens: 16385,
        },
        {
          displayName: 'GPT-4',
          functionCall: true,
          id: 'gpt-4',
          tokens: 8192,
        },
        {
          displayName: 'gpt-4-32k',
          functionCall: true,
          id: 'gpt-4-32k',
          tokens: 32768,
        },
        {
          displayName: 'GPT-4 Turbo Preview (1106)',
          functionCall: true,
          id: 'gpt-4-1106-preview',
          tokens: 128000,
        },
        {
          description: 'GPT-4 视觉预览版，支持视觉任务',
          displayName: 'GPT-4 Turbo Vision (Preview)',
          id: 'gpt-4-vision-preview',
          tokens: 128000,
          vision: true,
        },
      ]);
    });
    it('duplicate naming model', () => {
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

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels.find((s) => s.id === 'gpt-4-0125-preview')?.displayName).toEqual(
        'gpt-4-32k',
      );
    });

    it('should delete model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: { customModelName: '-gpt-4' },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result.find((r) => r.id === 'gpt-4')).toBeUndefined();
    });

    it('show the hidden model', () => {
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

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels.find((o) => o.id === 'gpt-4-1106-preview')).toEqual({
        displayName: 'GPT-4 Turbo Preview (1106)',
        functionCall: true,
        id: 'gpt-4-1106-preview',
        tokens: 128000,
      });
    });

    it('only add the model', () => {
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

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

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
});
