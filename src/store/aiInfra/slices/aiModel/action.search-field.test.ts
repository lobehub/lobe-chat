// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { aiModelService } from '@/services/aiModel';
import { useAiInfraStore } from '@/store/aiInfra';

vi.mock('@/services/aiModel', () => ({
  aiModelService: {
    updateAiModel: vi.fn(),
    getAiProviderModelList: vi.fn(),
    batchUpdateAiModels: vi.fn(),
  },
}));

vi.mock('@/services/models', () => ({
  modelsService: {
    getModels: vi.fn(),
  },
}));

describe('Model Properties Persistence Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Model intrinsic properties preservation', () => {
    it('should preserve intrinsic properties when user updates editable fields', async () => {
      const { result } = renderHook(() => useAiInfraStore());

      const modelWithSearch = {
        id: 'gemini-2.5-flash-preview-05-20',
        displayName: 'Gemini 2.5 Flash Preview 0520',
        abilities: {
          functionCall: true,
          reasoning: false,
          search: true,
          vision: true,
        },
        enabled: true,
        source: 'builtin' as const,
        type: 'chat' as const,
        contextWindowTokens: 1114112,
      };

      const modelWithoutSearch = {
        id: 'deepseek-reasoner',
        displayName: 'DeepSeek R1',
        abilities: {
          functionCall: true,
          reasoning: true,
          search: false,
          vision: false,
        },
        enabled: true,
        source: 'builtin' as const,
        type: 'chat' as const,
        contextWindowTokens: 65536,
      };

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([
        modelWithSearch,
        modelWithoutSearch,
      ]);

      act(() => {
        result.current.internal_setActiveAiProvider('google');
      });

      await act(async () => {
        await result.current.refreshAiModelList();
      });

      const initialModels = result.current.aiModelList;
      expect(initialModels).toHaveLength(2);

      const geminiModel = initialModels.find(m => m.id === 'gemini-2.5-flash-preview-05-20');
      const deepseekModel = initialModels.find(m => m.id === 'deepseek-reasoner');

      expect(geminiModel?.abilities?.search).toBe(true);
      expect(deepseekModel?.abilities?.search).toBe(false);

      const userModification = {
        displayName: 'My Custom Gemini Model',
        contextWindowTokens: 500000,
        abilities: {
          functionCall: false,
          vision: false,
        },
      };

      vi.mocked(aiModelService.updateAiModel).mockResolvedValue(undefined);

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([
        {
          ...modelWithSearch,
          displayName: userModification.displayName,
          contextWindowTokens: userModification.contextWindowTokens,
          abilities: {
            ...modelWithSearch.abilities,
            functionCall: false,
            vision: false,
          },
        },
        modelWithoutSearch,
      ]);

      await act(async () => {
        await result.current.updateAiModelsConfig(
          'gemini-2.5-flash-preview-05-20',
          'google',
          userModification
        );
      });

      expect(aiModelService.updateAiModel).toHaveBeenCalledWith(
        'gemini-2.5-flash-preview-05-20',
        'google',
        userModification
      );

      const updatedModels = result.current.aiModelList;
      const updatedGemini = updatedModels.find(m => m.id === 'gemini-2.5-flash-preview-05-20');
      const updatedDeepseek = updatedModels.find(m => m.id === 'deepseek-reasoner');

      expect(updatedGemini?.abilities?.search).toBe(true);
      expect(updatedDeepseek?.abilities?.search).toBe(false);
      expect(updatedGemini?.displayName).toBe('My Custom Gemini Model');
      expect(updatedGemini?.contextWindowTokens).toBe(500000);
      expect(updatedGemini?.abilities?.functionCall).toBe(false);
      expect(updatedGemini?.abilities?.vision).toBe(false);
    });

    it('should preserve intrinsic properties when fetching remote models', async () => {
      const { result } = renderHook(() => useAiInfraStore());

      const remoteModels = [
        {
          id: 'gemini-2.5-flash-preview-05-20',
          displayName: 'Gemini 2.5 Flash Preview 0520',
          functionCall: true,
          reasoning: false,
          search: true,
          vision: true,
          enabled: true,
        },
        {
          id: 'deepseek-reasoner',
          displayName: 'DeepSeek R1',
          functionCall: true,
          reasoning: true,
          search: false,
          vision: false,
          enabled: false,
        },
      ];

      const { modelsService } = await import('@/services/models');
      vi.mocked(modelsService.getModels).mockResolvedValue(remoteModels);

      vi.mocked(aiModelService.batchUpdateAiModels).mockResolvedValue(undefined);

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([
        {
          id: 'gemini-2.5-flash-preview-05-20',
          displayName: 'Gemini 2.5 Flash Preview 0520',
          abilities: {
            files: false,
            functionCall: true,
            reasoning: false,
            search: true,
            vision: true,
          },
          enabled: true,
          source: 'remote' as const,
          type: 'chat' as const,
          contextWindowTokens: 1114112,
        },
        {
          id: 'deepseek-reasoner',
          displayName: 'DeepSeek R1',
          abilities: {
            files: false,
            functionCall: true,
            reasoning: true,
            search: false,
            vision: false,
          },
          enabled: false,
          source: 'remote' as const,
          type: 'chat' as const,
          contextWindowTokens: 65536,
        },
      ]);

      await act(async () => {
        await result.current.fetchRemoteModelList('google');
      });

      expect(aiModelService.batchUpdateAiModels).toHaveBeenCalledWith([
        {
          id: 'gemini-2.5-flash-preview-05-20',
          displayName: 'Gemini 2.5 Flash Preview 0520',
          functionCall: true,
          reasoning: false,
          search: true,
          vision: true,
          abilities: {
            files: false,
            functionCall: true,
            reasoning: false,
            search: true,
            vision: true,
          },
          enabled: true,
          source: 'remote',
          type: 'chat',
        },
        {
          id: 'deepseek-reasoner',
          displayName: 'DeepSeek R1',
          functionCall: true,
          reasoning: true,
          search: false,
          vision: false,
          abilities: {
            files: false,
            functionCall: true,
            reasoning: true,
            search: false,
            vision: false,
          },
          enabled: false,
          source: 'remote',
          type: 'chat',
        },
      ]);

      const finalModels = result.current.aiModelList;
      expect(finalModels).toHaveLength(2);

      const geminiModel = finalModels.find((m: any) => m.id === 'gemini-2.5-flash-preview-05-20');
      const deepseekModel = finalModels.find((m: any) => m.id === 'deepseek-reasoner');

      expect(geminiModel?.abilities?.search).toBe(true);
      expect(deepseekModel?.abilities?.search).toBe(false);
    });
  });
});
