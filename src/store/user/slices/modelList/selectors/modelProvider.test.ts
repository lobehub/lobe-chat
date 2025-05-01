import { describe, expect, it } from 'vitest';

import { merge } from '@/utils/merge';

import { initialState } from '../../../initialState';
import { UserStore } from '../../../store';
import { getDefaultModeProviderById, modelProviderSelectors } from './modelProvider';

describe('modelProviderSelectors', () => {
  describe('getDefaultModeProviderById', () => {
    it('should return the correct ModelProviderCard when provider ID matches', () => {
      const s = merge(initialState, {}) as unknown as UserStore;

      const result = getDefaultModeProviderById('openai')(s);
      expect(result).not.toBeUndefined();
    });

    it('should return undefined when provider ID does not exist', () => {
      const s = merge(initialState, {} as any) as UserStore;
      const result = getDefaultModeProviderById('nonexistent' as any)(s);
      expect(result).toBeUndefined();
    });
  });

  describe('serverProviderModelCards', () => {
    it('should return server model cards for provider', () => {
      const s = merge(initialState, {
        serverLanguageModel: {
          openai: {
            serverModelCards: [{ id: 'server-model' }],
          },
        },
      }) as unknown as UserStore;

      const cards = modelProviderSelectors.serverProviderModelCards('openai')(s);
      expect(cards).toEqual([{ id: 'server-model' }]);
    });

    it('should return undefined if no server config', () => {
      const s = merge(initialState, {}) as unknown as UserStore;
      const cards = modelProviderSelectors.serverProviderModelCards('openai')(s);
      expect(cards).toBeUndefined();
    });

    it('should return undefined if provider not found in server config', () => {
      const s = merge(initialState, {
        serverLanguageModel: {
          anthropic: {
            serverModelCards: [{ id: 'claude' }],
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.serverProviderModelCards('openai')(s);
      expect(cards).toBeUndefined();
    });
  });

  describe('remoteProviderModelCards', () => {
    it('should return remote model cards for provider', () => {
      const s = merge(initialState, {
        settings: {
          languageModel: {
            openai: {
              remoteModelCards: [{ id: 'remote-model' }],
            },
          },
        },
      }) as unknown as UserStore;

      const cards = modelProviderSelectors.remoteProviderModelCards('openai')(s);
      expect(cards).toEqual([{ id: 'remote-model' }]);
    });

    it('should return undefined if no remote cards', () => {
      const s = merge(initialState, {}) as unknown as UserStore;
      const cards = modelProviderSelectors.remoteProviderModelCards('openai')(s);
      expect(cards).toBeUndefined();
    });

    it('should return undefined if provider not found in settings', () => {
      const s = merge(initialState, {
        settings: {
          languageModel: {
            anthropic: {
              remoteModelCards: [{ id: 'claude' }],
            },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.remoteProviderModelCards('openai')(s);
      expect(cards).toBeUndefined();
    });
  });

  describe('isProviderEnabled', () => {
    it('should return true if provider is enabled', () => {
      const s = merge(initialState, {
        settings: {
          languageModel: {
            openai: { enabled: true },
          },
        },
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isProviderEnabled('openai')(s)).toBe(true);
    });

    it('should return false if provider is disabled', () => {
      const s = merge(initialState, {
        settings: {
          languageModel: {
            openai: { enabled: false },
          },
        },
      }) as unknown as UserStore;
      expect(modelProviderSelectors.isProviderEnabled('openai')(s)).toBe(false);
    });

    it('should return true if provider settings not found (fallback to defaultModelProviderList)', () => {
      // openai is present in defaultModelProviderList in initialState, so fallback returns true
      const s = merge(initialState, {
        // Remove settings.languageModel (simulate missing settings)
        settings: {},
      }) as unknown as UserStore;
      // Remove defaultModelProviderList for this test
      (s as any).defaultModelProviderList = [
        {
          id: 'openai',
          enabled: true,
          chatModels: [],
        },
      ];
      expect(modelProviderSelectors.isProviderEnabled('openai')(s)).toBe(true);
    });

    it('should return true if provider key not present in languageModel and no defaultModelProviderList', () => {
      // According to implementation, if both are missing, returns true (default fallback)
      const s = merge(initialState, {
        settings: { languageModel: {} },
        defaultModelProviderList: [],
      }) as unknown as UserStore;
      expect(modelProviderSelectors.isProviderEnabled('openai')(s)).toBe(true);
    });

    it('should return true if provider key not present and defaultModelProviderList has provider with enabled false', () => {
      // According to implementation, returns true (default fallback)
      const s = merge(initialState, {
        settings: { languageModel: {} },
        defaultModelProviderList: [
          {
            id: 'openai',
            enabled: false,
            chatModels: [],
          },
        ],
      }) as unknown as UserStore;
      expect(modelProviderSelectors.isProviderEnabled('openai')(s)).toBe(true);
    });

    it('should return true if provider key not present and defaultModelProviderList has no match', () => {
      // According to implementation, returns true (default fallback)
      const s = merge(initialState, {
        settings: { languageModel: {} },
        defaultModelProviderList: [
          {
            id: 'anthropic',
            enabled: true,
            chatModels: [],
          },
        ],
      }) as unknown as UserStore;
      expect(modelProviderSelectors.isProviderEnabled('openai')(s)).toBe(true);
    });
  });

  describe('getModelCardsById', () => {
    it('should return model cards including custom model cards', () => {
      const s = merge(initialState, {
        settings: {
          languageModel: {
            openai: {
              customModelCards: [{ id: 'custom-model', displayName: 'Custom Model' }],
            },
          },
        },
      }) as unknown as UserStore;

      const modelCards = modelProviderSelectors.getModelCardsById('openai')(s);

      expect(modelCards).toContainEqual({
        id: 'custom-model',
        displayName: 'Custom Model',
        isCustom: true,
      });
    });

    it('should deduplicate model cards with same id', () => {
      const s = merge(initialState, {
        settings: {
          languageModel: {
            openai: {
              customModelCards: [
                { id: 'model-1', displayName: 'Custom Model 1' },
                { id: 'model-1', displayName: 'Custom Model 2' },
              ],
            },
          },
        },
      }) as unknown as UserStore;

      const modelCards = modelProviderSelectors.getModelCardsById('openai')(s);
      const model1Cards = modelCards.filter((m) => m.id === 'model-1');
      expect(model1Cards).toHaveLength(1);
    });

    it('should merge custom and builtin cards', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider1',
            chatModels: [{ id: 'builtin-model' }],
          },
        ],
        settings: {
          languageModel: {
            provider1: {
              customModelCards: [{ id: 'custom-model' }],
            },
          },
        },
      }) as unknown as UserStore;

      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toHaveLength(2);
      expect(cards.map((c) => c.id)).toContain('custom-model');
      expect(cards.map((c) => c.id)).toContain('builtin-model');
    });

    it('should handle empty custom model cards', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider1',
            chatModels: [{ id: 'builtin-model' }],
          },
        ],
      }) as unknown as UserStore;

      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('builtin-model');
    });

    it('should handle duplicate models between custom and builtin', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider1',
            chatModels: [{ id: 'model-1', displayName: 'Builtin Model' }],
          },
        ],
        settings: {
          languageModel: {
            provider1: {
              customModelCards: [{ id: 'model-1', displayName: 'Custom Model' }],
            },
          },
        },
      }) as unknown as UserStore;

      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toHaveLength(1);
      expect(cards[0].displayName).toBe('Custom Model');
    });

    it('should return empty array if no builtin or custom models', () => {
      const s = merge(initialState, {}) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toEqual([]);
    });

    it('should handle customModelCards undefined', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider1',
            chatModels: [{ id: 'builtin-model' }],
          },
        ],
        settings: {
          languageModel: {
            provider1: {},
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('builtin-model');
    });

    it('should handle customModelCards as empty array', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider1',
            chatModels: [{ id: 'builtin-model' }],
          },
        ],
        settings: {
          languageModel: {
            provider1: { customModelCards: [] },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('builtin-model');
    });

    it('should return only custom models if no builtin found', () => {
      const s = merge(initialState, {
        settings: {
          languageModel: {
            provider1: {
              customModelCards: [{ id: 'custom1' }],
            },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('custom1');
    });

    it('should handle multiple duplicate ids between custom and builtin and deduplicate by id', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider1',
            chatModels: [
              { id: 'model-1', displayName: 'Builtin Model 1' },
              { id: 'model-2', displayName: 'Builtin Model 2' },
            ],
          },
        ],
        settings: {
          languageModel: {
            provider1: {
              customModelCards: [
                { id: 'model-1', displayName: 'Custom Model 1' },
                { id: 'model-2', displayName: 'Custom Model 2' },
                { id: 'model-3', displayName: 'Custom Model 3' },
              ],
            },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('provider1')(s);
      expect(cards).toHaveLength(3);
      expect(cards.find((c) => c.id === 'model-1')?.displayName).toBe('Custom Model 1');
      expect(cards.find((c) => c.id === 'model-2')?.displayName).toBe('Custom Model 2');
      expect(cards.find((c) => c.id === 'model-3')?.displayName).toBe('Custom Model 3');
    });

    it('should prioritize custom model card over builtin with same id and deduplicate', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider2',
            chatModels: [
              { id: 'model-x', displayName: 'Builtin X' },
              { id: 'model-y', displayName: 'Builtin Y' },
            ],
          },
        ],
        settings: {
          languageModel: {
            provider2: {
              customModelCards: [
                { id: 'model-x', displayName: 'Custom X' },
                { id: 'model-y', displayName: 'Custom Y' },
              ],
            },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('provider2')(s);
      expect(cards).toHaveLength(2);
      expect(cards.find((c) => c.id === 'model-x')?.displayName).toBe('Custom X');
      expect(cards.find((c) => c.id === 'model-y')?.displayName).toBe('Custom Y');
    });

    it('should not mutate the original customModelCards or builtin cards', () => {
      const builtin = [{ id: 'builtin-1', displayName: 'B1' }];
      const custom = [{ id: 'custom-1', displayName: 'C1' }];
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'p',
            chatModels: builtin,
          },
        ],
        settings: {
          languageModel: {
            p: {
              customModelCards: custom,
            },
          },
        },
      }) as unknown as UserStore;
      modelProviderSelectors.getModelCardsById('p')(s);
      expect(builtin[0]).toEqual({ id: 'builtin-1', displayName: 'B1' });
      expect(custom[0]).toEqual({ id: 'custom-1', displayName: 'C1' });
    });

    it('should deduplicate when both custom and builtin have the same id, custom takes precedence', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'providerX',
            chatModels: [
              { id: 'dup-id', displayName: 'Builtin Version' },
              { id: 'unique-builtin', displayName: 'Unique Builtin' },
            ],
          },
        ],
        settings: {
          languageModel: {
            providerX: {
              customModelCards: [
                { id: 'dup-id', displayName: 'Custom Version' },
                { id: 'unique-custom', displayName: 'Unique Custom' },
              ],
            },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('providerX')(s);
      expect(cards).toHaveLength(3);
      expect(cards.find((c) => c.id === 'dup-id')?.displayName).toBe('Custom Version');
      expect(cards.find((c) => c.id === 'unique-builtin')).toBeDefined();
      expect(cards.find((c) => c.id === 'unique-custom')).toBeDefined();
    });

    it('should handle customModelCards as falsy', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'provider3',
            chatModels: [{ id: 'builtin-model' }],
          },
        ],
        settings: {
          languageModel: {
            provider3: { customModelCards: undefined },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('provider3')(s);
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('builtin-model');
    });

    it('should deduplicate when customModelCards and builtin have duplicate ids and uniqBy works', () => {
      const s = merge(initialState, {
        defaultModelProviderList: [
          {
            id: 'providerZ',
            chatModels: [
              { id: 'dup', displayName: 'Builtin Dup' },
              { id: 'unique', displayName: 'Unique Builtin' },
            ],
          },
        ],
        settings: {
          languageModel: {
            providerZ: {
              customModelCards: [
                { id: 'dup', displayName: 'Custom Dup' },
                { id: 'unique', displayName: 'Custom Unique' },
                { id: 'extra', displayName: 'Extra Custom' },
              ],
            },
          },
        },
      }) as unknown as UserStore;
      const cards = modelProviderSelectors.getModelCardsById('providerZ')(s);
      expect(cards).toHaveLength(3);
      expect(cards.find((c) => c.id === 'dup')?.displayName).toBe('Custom Dup');
      expect(cards.find((c) => c.id === 'unique')?.displayName).toBe('Custom Unique');
      expect(cards.find((c) => c.id === 'extra')?.displayName).toBe('Extra Custom');
    });
  });

  describe('modelProviderList', () => {
    it('should return model provider list', () => {
      const s = merge(initialState, {
        modelProviderList: [{ id: 'provider-1' }],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.modelProviderList(s)).toEqual([{ id: 'provider-1' }]);
    });

    it('should return empty array if no providers', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.modelProviderList(s)).toEqual([]);
    });
  });

  describe('modelProviderListForModelSelect', () => {
    it('should return enabled providers with enabled models', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            enabled: true,
            id: 'provider-1',
            chatModels: [
              {
                id: 'model-1',
                enabled: true,
                functionCall: true,
                displayName: 'Model 1',
                contextWindowTokens: 4096,
              },
              { id: 'model-2', enabled: false },
            ],
          },
        ],
      }) as unknown as UserStore;

      const result = modelProviderSelectors.modelProviderListForModelSelect(s);
      expect(result[0].children).toEqual([
        {
          id: 'model-1',
          displayName: 'Model 1',
          contextWindowTokens: 4096,
          abilities: {
            functionCall: true,
            vision: undefined,
          },
        },
      ]);
    });

    it('should filter out disabled providers', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            enabled: false,
            id: 'provider-1',
            chatModels: [{ id: 'model-1', enabled: true }],
          },
        ],
      }) as unknown as UserStore;

      const result = modelProviderSelectors.modelProviderListForModelSelect(s);
      expect(result).toEqual([]);
    });

    it('should filter out models with enabled=false', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            enabled: true,
            id: 'provider-1',
            chatModels: [{ id: 'model-1', enabled: false }],
          },
        ],
      }) as unknown as UserStore;
      const result = modelProviderSelectors.modelProviderListForModelSelect(s);
      expect(result[0].children).toEqual([]);
    });

    it('should return empty array if modelProviderList is empty', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;
      const result = modelProviderSelectors.modelProviderListForModelSelect(s);
      expect(result).toEqual([]);
    });
  });

  describe('modelEnabledVision', () => {
    it('should return true if the model has vision ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', vision: true }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledVision('model-1')(s)).toBe(true);
    });

    it('should return false if the model does not have vision ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', vision: false }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledVision('model-1')(s)).toBe(false);
    });

    it('should return true if model id includes vision', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-vision', vision: false }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledVision('model-vision')(s)).toBe(true);
    });

    it('should return true if model id is vision', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;
      expect(modelProviderSelectors.isModelEnabledVision('vision')(s)).toBe(true);
    });

    it('should return false if not found and id does not include vision', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;
      expect(modelProviderSelectors.isModelEnabledVision('model-plain')(s)).toBe(false);
    });
  });

  describe('modelEnabledFiles', () => {
    it('should return true if the model has file ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', files: true }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledFiles('model-1')(s)).toBe(true);
    });

    it('should return false if the model does not have file ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', files: false }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledFiles('model-1')(s)).toBe(false);
    });

    it('should return undefined if model is not found', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledFiles('non-existent')(s)).toBe(undefined);
    });
  });

  describe('isModelEnabledReasoning', () => {
    it('should return true if model has reasoning ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', reasoning: true }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledReasoning('model-1')(s)).toBe(true);
    });

    it('should return false if model does not have reasoning ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', reasoning: false }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledReasoning('model-1')(s)).toBe(false);
    });

    it('should return false if model not found', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledReasoning('model-1')(s)).toBe(false);
    });
  });

  describe('isModelEnabledUpload', () => {
    it('should return true if model has vision ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', vision: true }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledUpload('model-1')(s)).toBe(true);
    });

    it('should return true if model has files ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', files: true }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledUpload('model-1')(s)).toBe(true);
    });

    it('should return false if model has neither ability', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', files: false, vision: false }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelEnabledUpload('model-1')(s)).toBe(false);
    });

    it('should return false if model not found', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;

      // The function returns undefined, but we want Boolean false for "not found"
      expect(Boolean(modelProviderSelectors.isModelEnabledUpload('non-existent')(s))).toBe(false);
    });
  });

  describe('modelHasMaxToken', () => {
    it('should return true if model has contextWindowTokens', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', contextWindowTokens: 4096 }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelHasMaxToken('model-1')(s)).toBe(true);
    });

    it('should return false if model does not have contextWindowTokens', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1' }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelHasMaxToken('model-1')(s)).toBe(false);
    });

    it('should return false if model not found', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.isModelHasMaxToken('model-1')(s)).toBe(false);
    });
  });

  describe('modelMaxToken', () => {
    it('should return the correct token count for a model with specified tokens', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1', contextWindowTokens: 4096 }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.modelMaxToken('model-1')(s)).toBe(4096);
    });

    it('should return 0 for a model without a specified token count', () => {
      const s = merge(initialState, {
        modelProviderList: [
          {
            chatModels: [{ id: 'model-1' }],
          },
        ],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.modelMaxToken('model-1')(s)).toBe(0);
    });

    it('should return 0 for a non-existing model', () => {
      const s = merge(initialState, {
        modelProviderList: [],
      }) as unknown as UserStore;

      expect(modelProviderSelectors.modelMaxToken('model-1')(s)).toBe(0);
    });
  });
});
