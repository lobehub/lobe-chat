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

describe('Model Abilities Persistence Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Intrinsic vs editable properties', () => {
    it('should preserve search capability when updating editable properties', async () => {
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

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([modelWithSearch]);

      act(() => {
        result.current.internal_setActiveAiProvider('google');
      });

      await act(async () => {
        await result.current.refreshAiModelList();
      });

      const initialModels = result.current.aiModelList;
      const initialModel = initialModels.find((m: any) => m.id === 'gemini-2.5-flash-preview-05-20');
      
      expect(initialModel?.abilities?.search).toBe(true);

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
      const updatedModel = updatedModels.find((m: any) => m.id === 'gemini-2.5-flash-preview-05-20');

      expect(updatedModel?.abilities?.search).toBe(true);
      expect(updatedModel?.abilities?.functionCall).toBe(false);
      expect(updatedModel?.abilities?.vision).toBe(false);
      expect(updatedModel?.displayName).toBe('My Custom Gemini Model');
      expect(updatedModel?.contextWindowTokens).toBe(500000);
    });

    it('should maintain non-search models correctly', async () => {
      const { result } = renderHook(() => useAiInfraStore());

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

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([modelWithoutSearch]);

      act(() => {
        result.current.internal_setActiveAiProvider('deepseek');
      });

      await act(async () => {
        await result.current.refreshAiModelList();
      });

      const initialModels = result.current.aiModelList;
      const initialModel = initialModels.find((m: any) => m.id === 'deepseek-reasoner');
      
      expect(initialModel?.abilities?.search).toBe(false);

      const userModification = {
        displayName: 'My DeepSeek R1',
        contextWindowTokens: 32768,
        abilities: {
          functionCall: false,
          vision: true,
        },
      };

      vi.mocked(aiModelService.updateAiModel).mockResolvedValue(undefined);

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([
        {
          ...modelWithoutSearch,
          displayName: userModification.displayName,
          contextWindowTokens: userModification.contextWindowTokens,
          abilities: {
            ...modelWithoutSearch.abilities,
            functionCall: false,
            vision: true,
          },
        },
      ]);

      await act(async () => {
        await result.current.updateAiModelsConfig('deepseek-reasoner', 'deepseek', userModification);
      });

      const updatedModels = result.current.aiModelList;
      const updatedModel = updatedModels.find((m: any) => m.id === 'deepseek-reasoner');

      expect(updatedModel?.abilities?.search).toBe(false);
      expect(updatedModel?.abilities?.reasoning).toBe(true);
      expect(updatedModel?.abilities?.functionCall).toBe(false);
      expect(updatedModel?.abilities?.vision).toBe(true);
      expect(updatedModel?.displayName).toBe('My DeepSeek R1');
      expect(updatedModel?.contextWindowTokens).toBe(32768);
    });
  });

  describe('Remote model synchronization', () => {
    it('should preserve intrinsic abilities during remote sync', async () => {
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

      const models = result.current.aiModelList;
      const geminiModel = models.find((m: any) => m.id === 'gemini-2.5-flash-preview-05-20');
      const deepseekModel = models.find((m: any) => m.id === 'deepseek-reasoner');

      expect(geminiModel?.abilities?.search).toBe(true);
      expect(deepseekModel?.abilities?.search).toBe(false);

      expect(aiModelService.batchUpdateAiModels).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'gemini-2.5-flash-preview-05-20',
            abilities: expect.objectContaining({
              search: true,
            }),
          }),
          expect.objectContaining({
            id: 'deepseek-reasoner',
            abilities: expect.objectContaining({
              search: false,
            }),
          }),
        ])
      );
    });
  });
});
