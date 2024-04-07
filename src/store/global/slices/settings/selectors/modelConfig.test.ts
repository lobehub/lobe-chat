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
              models: ['llava'],
            },
          },
        },
      } as GlobalSettingsState) as unknown as GlobalStore;

      const ollamaList = modelConfigSelectors.modelSelectList(s).find((r) => r.id === 'ollama');

      expect(ollamaList?.chatModels).toEqual([]);
    });
  });
});
