import * as runtimeModule from '@lobechat/model-runtime';
import type { EnabledAiModel, ModelAbilities } from 'model-bank';
import { describe, expect, it, vi } from 'vitest';

import { getModelListByType } from '../action';

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
      parameters: {
        prompt: { default: '' },
        size: { default: '1024x1024', enum: ['512x512', '1024x1024', '1536x1536'] },
      },
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
    it('should filter models by providerId and type correctly', async () => {
      const result = await getModelListByType(allModels, 'openai', 'chat');

      expect(result).toHaveLength(2);
      expect(result.map((m) => m.id)).toEqual(['gpt-4', 'gpt-3.5-turbo']);
    });

    it('should return correct model structure', async () => {
      const result = await getModelListByType(allModels, 'openai', 'chat');

      expect(result[0]).toEqual({
        abilities: { functionCall: true, files: true },
        contextWindowTokens: 8192,
        displayName: 'GPT-4',
        id: 'gpt-4',
      });
    });

    it('should add parameters field for image models', async () => {
      const result = await getModelListByType(allModels, 'openai', 'image');

      expect(result[0]).toEqual({
        abilities: {},
        contextWindowTokens: undefined,
        displayName: 'DALL-E 3',
        id: 'dall-e-3',
        parameters: {
          prompt: { default: '' },
          size: { default: '1024x1024', enum: ['512x512', '1024x1024', '1536x1536'] },
        },
      });
    });

    it('should use fallback parameters for image models without parameters', async () => {
      // Mock getModelPropertyWithFallback
      vi.spyOn(runtimeModule, 'getModelPropertyWithFallback').mockResolvedValueOnce({
        size: '1024x1024',
      });

      const result = await getModelListByType(allModels, 'midjourney', 'image');

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
    it('should handle empty model list', async () => {
      const result = await getModelListByType([], 'openai', 'chat');
      expect(result).toEqual([]);
    });

    it('should handle non-existent providerId', async () => {
      const result = await getModelListByType(allModels, 'nonexistent', 'chat');
      expect(result).toEqual([]);
    });

    it('should handle non-existent type', async () => {
      const result = await getModelListByType(allModels, 'openai', 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle missing displayName', async () => {
      const modelsWithoutDisplayName: EnabledAiModel[] = [
        {
          id: 'test-model',
          providerId: 'test',
          type: 'chat',
          abilities: {} as ModelAbilities,
          enabled: true,
        },
      ];

      const result = await getModelListByType(modelsWithoutDisplayName, 'test', 'chat');
      expect(result[0].displayName).toBe('');
    });

    it('should handle missing abilities', async () => {
      const modelsWithoutAbilities: EnabledAiModel[] = [
        {
          id: 'test-model',
          providerId: 'test',
          type: 'chat',
          enabled: true,
        } as EnabledAiModel,
      ];

      const result = await getModelListByType(modelsWithoutAbilities, 'test', 'chat');
      expect(result[0].abilities).toEqual({});
    });
  });

  describe('deduplication', () => {
    it('should remove duplicate model IDs', async () => {
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

      const result = await getModelListByType(duplicateModels, 'openai', 'chat');

      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe('GPT-4 Version 1');
    });
  });

  describe('type casting', () => {
    it('should handle image model type casting correctly', async () => {
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

      const result = await getModelListByType(imageModel, 'openai', 'image');

      expect(result[0]).toHaveProperty('parameters');
      expect(result[0].parameters).toEqual({ size: '1024x1024' });
    });

    it('should not add parameters field for non-image models', async () => {
      const result = await getModelListByType(mockChatModels, 'openai', 'chat');

      result.forEach((model) => {
        expect(model).not.toHaveProperty('parameters');
      });
    });
  });

  describe('async parameter handling', () => {
    it('should handle async parameter fetching for multiple models', async () => {
      const imageModelsWithoutParameters: EnabledAiModel[] = [
        {
          id: 'stable-diffusion',
          providerId: 'stability',
          type: 'image',
          abilities: {} as ModelAbilities,
          displayName: 'Stable Diffusion',
          enabled: true,
        },
        {
          id: 'flux-schnell',
          providerId: 'fal',
          type: 'image',
          abilities: {} as ModelAbilities,
          displayName: 'FLUX Schnell',
          enabled: true,
        },
      ];

      // Mock getModelPropertyWithFallback for the specific model
      vi.spyOn(runtimeModule, 'getModelPropertyWithFallback').mockResolvedValue({
        prompt: { default: '' },
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
      });

      const result = await getModelListByType(imageModelsWithoutParameters, 'stability', 'image');

      expect(result).toHaveLength(1);
      expect(result[0].parameters).toEqual({
        prompt: { default: '' },
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
      });

      // Verify the mock was called for the correct model
      expect(runtimeModule.getModelPropertyWithFallback).toHaveBeenCalledWith(
        'stable-diffusion',
        'parameters',
      );
    });

    it('should handle failed parameter fallback gracefully', async () => {
      const imageModelWithoutParameters: EnabledAiModel[] = [
        {
          id: 'failing-model',
          providerId: 'test-provider',
          type: 'image',
          abilities: {} as ModelAbilities,
          displayName: 'Failing Model',
          enabled: true,
        },
      ];

      // Mock getModelPropertyWithFallback to resolve with undefined/empty object
      vi.spyOn(runtimeModule, 'getModelPropertyWithFallback').mockResolvedValueOnce(undefined);

      // Should handle gracefully when fallback returns undefined
      const result = await getModelListByType(
        imageModelWithoutParameters,
        'test-provider',
        'image',
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('failing-model');
      // parameters should be undefined when fallback returns undefined
      expect(result[0].parameters).toBeUndefined();
    });
  });

  describe('concurrent processing', () => {
    it('should handle concurrent model processing correctly', async () => {
      const manyModels: EnabledAiModel[] = Array.from({ length: 10 }, (_, i) => ({
        id: `model-${i}`,
        providerId: 'test-provider',
        type: 'chat',
        abilities: { functionCall: i % 2 === 0 } as ModelAbilities,
        contextWindowTokens: 4096 + i * 1000,
        displayName: `Model ${i}`,
        enabled: true,
      }));

      const result = await getModelListByType(manyModels, 'test-provider', 'chat');

      expect(result).toHaveLength(10);
      expect(result.map((m) => m.id)).toEqual(manyModels.map((m) => m.id));

      // Verify all models were processed correctly
      result.forEach((model, index) => {
        expect(model.abilities.functionCall).toBe(index % 2 === 0);
        expect(model.contextWindowTokens).toBe(4096 + index * 1000);
      });
    });

    it('should maintain order of models in concurrent processing', async () => {
      const orderedModels: EnabledAiModel[] = [
        {
          id: 'first-model',
          providerId: 'test',
          type: 'chat',
          abilities: {} as ModelAbilities,
          displayName: 'First Model',
          enabled: true,
        },
        {
          id: 'second-model',
          providerId: 'test',
          type: 'chat',
          abilities: {} as ModelAbilities,
          displayName: 'Second Model',
          enabled: true,
        },
        {
          id: 'third-model',
          providerId: 'test',
          type: 'chat',
          abilities: {} as ModelAbilities,
          displayName: 'Third Model',
          enabled: true,
        },
      ];

      const result = await getModelListByType(orderedModels, 'test', 'chat');

      expect(result.map((m) => m.id)).toEqual(['first-model', 'second-model', 'third-model']);
    });
  });

  describe('model property handling', () => {
    it('should preserve all required model properties', async () => {
      const complexModel: EnabledAiModel[] = [
        {
          id: 'complex-model',
          providerId: 'test',
          type: 'chat',
          abilities: {
            functionCall: true,
            files: true,
            vision: false,
          } as ModelAbilities,
          contextWindowTokens: 128000,
          displayName: 'Complex Model with All Properties',
          enabled: true,
        },
      ];

      const result = await getModelListByType(complexModel, 'test', 'chat');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'complex-model',
        displayName: 'Complex Model with All Properties',
        abilities: {
          functionCall: true,
          files: true,
          vision: false,
        },
        contextWindowTokens: 128000,
      });
    });

    it('should handle undefined contextWindowTokens gracefully', async () => {
      const modelWithoutTokens: EnabledAiModel[] = [
        {
          id: 'no-tokens-model',
          providerId: 'test',
          type: 'chat',
          abilities: {} as ModelAbilities,
          displayName: 'Model Without Tokens',
          enabled: true,
          // contextWindowTokens is undefined
        },
      ];

      const result = await getModelListByType(modelWithoutTokens, 'test', 'chat');

      expect(result).toHaveLength(1);
      expect(result[0].contextWindowTokens).toBeUndefined();
    });
  });
});
