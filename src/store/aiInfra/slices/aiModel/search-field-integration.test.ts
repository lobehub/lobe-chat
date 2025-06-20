// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { aiModelService } from '@/services/aiModel';
import { useAiInfraStore } from '@/store/aiInfra';
import { UpdateAiModelParams } from '@/types/aiModel';

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

describe('Model Properties Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User editable vs intrinsic properties', () => {
    it('should maintain intrinsic properties after user updates editable fields', async () => {
      const { result } = renderHook(() => useAiInfraStore());

      const initialModel = {
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

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([initialModel]);

      act(() => {
        result.current.internal_setActiveAiProvider('google');
      });

      await act(async () => {
        await result.current.refreshAiModelList();
      });

      const models = result.current.aiModelList;
      expect(models[0]?.abilities?.search).toBe(true);

      const updateData: UpdateAiModelParams = {
        displayName: 'My Custom Gemini Model',
        contextWindowTokens: 500000,
      };

      vi.mocked(aiModelService.updateAiModel).mockResolvedValue(undefined);

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([
        {
          ...initialModel,
          displayName: updateData.displayName,
          contextWindowTokens: updateData.contextWindowTokens,
        },
      ]);

      await act(async () => {
        await result.current.updateAiModelsConfig('gemini-2.5-flash-preview-05-20', 'google', updateData);
      });

      expect(aiModelService.updateAiModel).toHaveBeenCalledWith('gemini-2.5-flash-preview-05-20', 'google', updateData);

      const updatedModels = result.current.aiModelList;
      const updatedModel = updatedModels.find((m: any) => m.id === 'gemini-2.5-flash-preview-05-20');

      expect(updatedModel?.abilities?.search).toBe(true);
      expect(updatedModel?.displayName).toBe('My Custom Gemini Model');
      expect(updatedModel?.contextWindowTokens).toBe(500000);
    });

    it('should maintain intrinsic properties for models without search capability', async () => {
      const { result } = renderHook(() => useAiInfraStore());

      const initialModel = {
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

      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([initialModel]);

      act(() => {
        result.current.internal_setActiveAiProvider('deepseek');
      });

      await act(async () => {
        await result.current.refreshAiModelList();
      });

      const models = result.current.aiModelList;
      expect(models[0]?.abilities?.search).toBe(false);

      const updateData: UpdateAiModelParams = {
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
          ...initialModel,
          displayName: updateData.displayName,
          contextWindowTokens: updateData.contextWindowTokens,
          abilities: {
            ...initialModel.abilities,
            functionCall: false,
            vision: true,
          },
        },
      ]);

      await act(async () => {
        await result.current.updateAiModelsConfig('deepseek-reasoner', 'deepseek', updateData);
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

  describe('Schema validation and data persistence', () => {
    it('should handle complete abilities updates correctly', async () => {
      const { result } = renderHook(() => useAiInfraStore());

      const updateDataWithAbilities: UpdateAiModelParams = {
        displayName: 'Custom Model',
        abilities: {
          functionCall: true,
          reasoning: false,
          search: true,
          vision: false,
        },
        contextWindowTokens: 8192,
      };

      vi.mocked(aiModelService.updateAiModel).mockResolvedValue(undefined);
      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([
        {
          id: 'custom-model',
          displayName: 'Custom Model',
          abilities: updateDataWithAbilities.abilities!,
          enabled: true,
          source: 'custom' as const,
          type: 'chat' as const,
          contextWindowTokens: 8192,
        },
      ]);

      act(() => {
        result.current.internal_setActiveAiProvider('custom-provider');
      });

      await act(async () => {
        await result.current.updateAiModelsConfig('custom-model', 'custom-provider', updateDataWithAbilities);
      });

      expect(aiModelService.updateAiModel).toHaveBeenCalledWith(
        'custom-model',
        'custom-provider',
        updateDataWithAbilities
      );

      const models = result.current.aiModelList;
      const model = models.find((m: any) => m.id === 'custom-model');
      expect(model?.abilities?.search).toBe(true);
    });
  });

  describe('Scenario: Remote model fetching preserves search capabilities', () => {
    it('should correctly map search field from remote API to local storage', async () => {
      const { result } = renderHook(() => useAiInfraStore());

      // 模拟远程 API 返回的模型数据（如 XAI Grok 模型支持搜索）
      const remoteModels = [
        {
          id: 'grok-3',
          displayName: 'Grok 3',
          functionCall: true,
          reasoning: true,
          search: true, // 远程 API 返回支持搜索
          vision: false,
          enabled: true,
        },
        {
          id: 'grok-mini',
          displayName: 'Grok Mini',
          functionCall: false,
          reasoning: false,
          search: false, // 远程 API 返回不支持搜索
          vision: false,
          enabled: false,
        },
      ];

      const { modelsService } = await import('@/services/models');
      vi.mocked(modelsService.getModels).mockResolvedValue(remoteModels);
      vi.mocked(aiModelService.batchUpdateAiModels).mockResolvedValue(undefined);
      vi.mocked(aiModelService.getAiProviderModelList).mockResolvedValue([
        {
          id: 'grok-3',
          displayName: 'Grok 3',
          abilities: {
            files: false,
            functionCall: true,
            reasoning: true,
            search: true, // 应该正确映射
            vision: false,
          },
          enabled: true,
          source: 'remote' as const,
          type: 'chat' as const,
        },
        {
          id: 'grok-mini',
          displayName: 'Grok Mini',
          abilities: {
            files: false,
            functionCall: false,
            reasoning: false,
            search: false, // 应该正确映射
            vision: false,
          },
          enabled: false,
          source: 'remote' as const,
          type: 'chat' as const,
        },
      ]);

      // 执行远程模型获取
      await act(async () => {
        await result.current.fetchRemoteModelList('xai');
      });

      // 验证 search 字段的正确映射
      const models = result.current.aiModelList;
      const grok3 = models.find(m => m.id === 'grok-3');
      const grokMini = models.find(m => m.id === 'grok-mini');

      expect(grok3?.abilities?.search).toBe(true);
      expect(grokMini?.abilities?.search).toBe(false);

      // 验证 batchUpdateAiModels 调用时包含正确的 search 字段
      expect(aiModelService.batchUpdateAiModels).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'grok-3',
            abilities: expect.objectContaining({
              search: true,
            }),
          }),
          expect.objectContaining({
            id: 'grok-mini',
            abilities: expect.objectContaining({
              search: false,
            }),
          }),
        ])
      );
    });
  });
});
