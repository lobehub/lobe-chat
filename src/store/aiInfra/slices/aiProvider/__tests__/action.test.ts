import { describe, expect, it, vi } from 'vitest';

import type { EnabledAiModel, ModelAbilities } from '@/types/aiModel';

import { getModelListByType } from '../action';

// Mock getModelPropertyWithFallback
vi.mock('@/utils/getFallbackModelProperty', () => ({
  getModelPropertyWithFallback: vi.fn().mockReturnValue({ size: '1024x1024' }),
}));

describe('getModelListByType', () => {
  const mockChatModels: EnabledAiModel[] = [
    {
      id: 'gpt-4',
      providerId: 'openai',
      type: 'chat',
      abilities: { functionCall: true, files: true } as ModelAbilities,
      contextWindowTokens: 8192,
      displayName: 'GPT-4',
      enabled: true,
    },
    {
      id: 'gpt-3.5-turbo',
      providerId: 'openai',
      type: 'chat',
      abilities: { functionCall: true } as ModelAbilities,
      contextWindowTokens: 4096,
      displayName: 'GPT-3.5 Turbo',
      enabled: true,
    },
    {
      id: 'claude-3-opus',
      providerId: 'anthropic',
      type: 'chat',
      abilities: { functionCall: false, files: true } as ModelAbilities,
      contextWindowTokens: 200000,
      displayName: 'Claude 3 Opus',
      enabled: true,
    },
  ];

  const mockImageModels: EnabledAiModel[] = [
    {
      id: 'dall-e-3',
      providerId: 'openai',
      type: 'image',
      abilities: {} as ModelAbilities,
      displayName: 'DALL-E 3',
      enabled: true,
      parameters: { size: '1024x1024', quality: 'standard' },
    },
    {
      id: 'midjourney',
      providerId: 'midjourney',
      type: 'image',
      abilities: {} as ModelAbilities,
      displayName: 'Midjourney',
      enabled: true,
    },
  ];

  const allModels = [...mockChatModels, ...mockImageModels];

  describe('basic functionality', () => {
    it('should filter models by providerId and type correctly', () => {
      const result = getModelListByType(allModels, 'openai', 'chat');

      expect(result).toHaveLength(2);
      expect(result.map((m) => m.id)).toEqual(['gpt-4', 'gpt-3.5-turbo']);
    });

    it('should return correct model structure', () => {
      const result = getModelListByType(allModels, 'openai', 'chat');

      expect(result[0]).toEqual({
        abilities: { functionCall: true, files: true },
        contextWindowTokens: 8192,
        displayName: 'GPT-4',
        id: 'gpt-4',
      });
    });

    it('should add parameters field for image models', () => {
      const result = getModelListByType(allModels, 'openai', 'image');

      expect(result[0]).toEqual({
        abilities: {},
        contextWindowTokens: undefined,
        displayName: 'DALL-E 3',
        id: 'dall-e-3',
        parameters: { size: '1024x1024', quality: 'standard' },
      });
    });

    it('should use fallback parameters for image models without parameters', () => {
      const result = getModelListByType(allModels, 'midjourney', 'image');

      expect(result[0]).toEqual({
        abilities: {},
        contextWindowTokens: undefined,
        displayName: 'Midjourney',
        id: 'midjourney',
        parameters: { size: '1024x1024' },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty model list', () => {
      const result = getModelListByType([], 'openai', 'chat');
      expect(result).toEqual([]);
    });

    it('should handle non-existent providerId', () => {
      const result = getModelListByType(allModels, 'nonexistent', 'chat');
      expect(result).toEqual([]);
    });

    it('should handle non-existent type', () => {
      const result = getModelListByType(allModels, 'openai', 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle missing displayName', () => {
      const modelsWithoutDisplayName: EnabledAiModel[] = [
        {
          id: 'test-model',
          providerId: 'test',
          type: 'chat',
          abilities: {} as ModelAbilities,
          enabled: true,
        },
      ];

      const result = getModelListByType(modelsWithoutDisplayName, 'test', 'chat');
      expect(result[0].displayName).toBe('');
    });

    it('should handle missing abilities', () => {
      const modelsWithoutAbilities: EnabledAiModel[] = [
        {
          id: 'test-model',
          providerId: 'test',
          type: 'chat',
          enabled: true,
        } as EnabledAiModel,
      ];

      const result = getModelListByType(modelsWithoutAbilities, 'test', 'chat');
      expect(result[0].abilities).toEqual({});
    });
  });

  describe('deduplication', () => {
    it('should remove duplicate model IDs', () => {
      const duplicateModels: EnabledAiModel[] = [
        {
          id: 'gpt-4',
          providerId: 'openai',
          type: 'chat',
          abilities: { functionCall: true } as ModelAbilities,
          displayName: 'GPT-4 Version 1',
          enabled: true,
        },
        {
          id: 'gpt-4',
          providerId: 'openai',
          type: 'chat',
          abilities: { functionCall: false } as ModelAbilities,
          displayName: 'GPT-4 Version 2',
          enabled: true,
        },
      ];

      const result = getModelListByType(duplicateModels, 'openai', 'chat');

      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe('GPT-4 Version 1');
    });
  });

  describe('type casting', () => {
    it('should handle image model type casting correctly', () => {
      const imageModel: EnabledAiModel[] = [
        {
          id: 'dall-e-3',
          providerId: 'openai',
          type: 'image',
          abilities: {} as ModelAbilities,
          displayName: 'DALL-E 3',
          enabled: true,
          parameters: { size: '1024x1024' },
        } as any, // Simulate AIImageModelCard type
      ];

      const result = getModelListByType(imageModel, 'openai', 'image');

      expect(result[0]).toHaveProperty('parameters');
      expect(result[0].parameters).toEqual({ size: '1024x1024' });
    });

    it('should not add parameters field for non-image models', () => {
      const result = getModelListByType(mockChatModels, 'openai', 'chat');

      result.forEach((model) => {
        expect(model).not.toHaveProperty('parameters');
      });
    });
  });
});
