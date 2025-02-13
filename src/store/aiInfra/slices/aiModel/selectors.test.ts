import { describe, expect, it } from 'vitest';

import { AIProviderStoreState } from '@/store/aiInfra/initialState';
import { aiModelSelectors } from '@/store/aiInfra/slices/aiModel/selectors';
import { AiModelSourceEnum } from '@/types/aiModel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockState: any = {
  aiModelLoadingIds: ['loading-model'],
  aiProviderModelList: [
    {
      enabled: true,
      id: 'model1',
      type: 'chat',
      displayName: 'Model One',
    },
    {
      enabled: false,
      id: 'model2',
      type: 'chat',
      displayName: 'Model Two',
    },
    {
      enabled: true,
      id: 'model3',
      type: 'embedding',
      displayName: 'Model Three',
    },
    {
      enabled: true,
      id: 'model4',
      type: 'chat',
      source: AiModelSourceEnum.Remote,
      displayName: 'Remote Model',
    },
  ],
  enabledAiModels: [
    {
      abilities: {
        functionCall: true,
        vision: true,
        reasoning: true,
      },
      contextWindowTokens: 16000,
      id: 'model1',
      providerId: 'provider1',
      type: 'chat',
    },
    {
      abilities: {
        functionCall: false,
        vision: false,
        reasoning: false,
      },
      id: 'model4',
      providerId: 'provider2',
      type: 'chat',
    },
  ],
  modelSearchKeyword: '',
};

describe('aiModelSelectors', () => {
  describe('aiProviderChatModelListIds', () => {
    it('should return only chat model ids', () => {
      const result = aiModelSelectors.aiProviderChatModelListIds(mockState);
      expect(result).toEqual(['model1', 'model2', 'model4']);
    });
  });

  describe('enabledAiProviderModelList', () => {
    it('should return only enabled models', () => {
      const result = aiModelSelectors.enabledAiProviderModelList(mockState);
      expect(result).toHaveLength(3);
      expect(result.every((model) => model.enabled)).toBe(true);
    });
  });

  describe('disabledAiProviderModelList', () => {
    it('should return only disabled models', () => {
      const result = aiModelSelectors.disabledAiProviderModelList(mockState);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('model2');
    });
  });

  describe('filteredAiProviderModelList', () => {
    it('should return all models when no search keyword', () => {
      const result = aiModelSelectors.filteredAiProviderModelList(mockState);
      expect(result).toHaveLength(4);
    });

    it('should filter models by id', () => {
      const state = { ...mockState, modelSearchKeyword: 'model1' };
      const result = aiModelSelectors.filteredAiProviderModelList(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('model1');
    });

    it('should filter models by displayName', () => {
      const state = { ...mockState, modelSearchKeyword: 'Remote' };
      const result = aiModelSelectors.filteredAiProviderModelList(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('model4');
    });
  });

  describe('totalAiProviderModelList', () => {
    it('should return total count of models', () => {
      const result = aiModelSelectors.totalAiProviderModelList(mockState);
      expect(result).toBe(4);
    });
  });

  describe('isEmptyAiProviderModelList', () => {
    it('should return true when list is empty', () => {
      const state = { ...mockState, aiProviderModelList: [] };
      const result = aiModelSelectors.isEmptyAiProviderModelList(state);
      expect(result).toBe(true);
    });

    it('should return false when list is not empty', () => {
      const result = aiModelSelectors.isEmptyAiProviderModelList(mockState);
      expect(result).toBe(false);
    });
  });

  describe('hasRemoteModels', () => {
    it('should return true when remote models exist', () => {
      const result = aiModelSelectors.hasRemoteModels(mockState);
      expect(result).toBe(true);
    });

    it('should return false when no remote models', () => {
      const state = {
        ...mockState,
        aiProviderModelList: mockState.aiProviderModelList.filter(
          (m: { source: string }) => m.source !== AiModelSourceEnum.Remote,
        ),
      };
      const result = aiModelSelectors.hasRemoteModels(state);
      expect(result).toBe(false);
    });
  });

  describe('isModelEnabled', () => {
    it('should return true for enabled model', () => {
      const result = aiModelSelectors.isModelEnabled('model1')(mockState);
      expect(result).toBe(true);
    });

    it('should return false for disabled model', () => {
      const result = aiModelSelectors.isModelEnabled('model2')(mockState);
      expect(result).toBe(false);
    });
  });

  describe('isModelLoading', () => {
    it('should return true for loading model', () => {
      const result = aiModelSelectors.isModelLoading('loading-model')(mockState);
      expect(result).toBe(true);
    });

    it('should return false for non-loading model', () => {
      const result = aiModelSelectors.isModelLoading('model1')(mockState);
      expect(result).toBe(false);
    });
  });

  describe('getAiModelById', () => {
    it('should return model by id', () => {
      const result = aiModelSelectors.getAiModelById('model1')(mockState);
      expect(result).toBeDefined();
      expect(result?.id).toBe('model1');
    });

    it('should return undefined for non-existent model', () => {
      const result = aiModelSelectors.getAiModelById('non-existent')(mockState);
      expect(result).toBeUndefined();
    });
  });

  describe('isModelSupportToolUse', () => {
    it('should return true when model supports function call', () => {
      const result = aiModelSelectors.isModelSupportToolUse('model1', 'provider1')(mockState);
      expect(result).toBe(true);
    });

    it('should return false when model does not support function call', () => {
      const result = aiModelSelectors.isModelSupportToolUse('model4', 'provider2')(mockState);
      expect(result).toBe(false);
    });
  });

  describe('isModelSupportVision', () => {
    it('should return true when model supports vision', () => {
      const result = aiModelSelectors.isModelSupportVision('model1', 'provider1')(mockState);
      expect(result).toBe(true);
    });

    it('should return false when model does not support vision', () => {
      const result = aiModelSelectors.isModelSupportVision('model4', 'provider2')(mockState);
      expect(result).toBe(false);
    });
  });

  describe('isModelSupportReasoning', () => {
    it('should return true when model supports reasoning', () => {
      const result = aiModelSelectors.isModelSupportReasoning('model1', 'provider1')(mockState);
      expect(result).toBe(true);
    });

    it('should return false when model does not support reasoning', () => {
      const result = aiModelSelectors.isModelSupportReasoning('model4', 'provider2')(mockState);
      expect(result).toBe(false);
    });
  });

  describe('isModelHasContextWindowToken', () => {
    it('should return true when model has context window tokens', () => {
      const result = aiModelSelectors.isModelHasContextWindowToken(
        'model1',
        'provider1',
      )(mockState);
      expect(result).toBe(true);
    });

    it('should return false when model does not have context window tokens', () => {
      const result = aiModelSelectors.isModelHasContextWindowToken(
        'model4',
        'provider2',
      )(mockState);
      expect(result).toBe(false);
    });
  });

  describe('modelContextWindowTokens', () => {
    it('should return context window tokens when available', () => {
      const result = aiModelSelectors.modelContextWindowTokens('model1', 'provider1')(mockState);
      expect(result).toBe(16000);
    });

    it('should return undefined when context window tokens not available', () => {
      const result = aiModelSelectors.modelContextWindowTokens('model4', 'provider2')(mockState);
      expect(result).toBeUndefined();
    });
  });
});
