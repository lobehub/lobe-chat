import * as runtimeModule from '@lobechat/model-runtime';
import type { EnabledAiModel, ModelAbilities } from 'model-bank';
import { describe, expect, it, vi } from 'vitest';

import { getModelListByType } from '../action';

// Test fixtures
const createChatModel = (
  id: string,
  providerId: string,
  overrides: Partial<EnabledAiModel> = {},
): EnabledAiModel => ({
  id,
  providerId,
  type: 'chat',
  abilities: { functionCall: true, files: true } satisfies ModelAbilities,
  contextWindowTokens: 8192,
  displayName: `${id} model`,
  enabled: true,
  ...overrides,
});

const createImageModel = (
  id: string,
  providerId: string,
  overrides: Partial<EnabledAiModel> = {},
): EnabledAiModel => ({
  id,
  providerId,
  type: 'image',
  abilities: {} satisfies ModelAbilities,
  displayName: `${id} model`,
  enabled: true,
  ...overrides,
});

// Core test data
const mockChatModels = [
  createChatModel('gpt-4', 'openai', {
    displayName: 'GPT-4',
    abilities: { functionCall: true, files: true } satisfies ModelAbilities,
  }),
  createChatModel('gpt-3.5-turbo', 'openai', {
    displayName: 'GPT-3.5 Turbo',
    abilities: { functionCall: true } satisfies ModelAbilities,
    contextWindowTokens: 4096,
  }),
  createChatModel('claude-3-opus', 'anthropic', {
    displayName: 'Claude 3 Opus',
    abilities: { functionCall: false, files: true } satisfies ModelAbilities,
    contextWindowTokens: 200000,
  }),
];

const mockImageModels = [
  createImageModel('dall-e-3', 'openai', {
    displayName: 'DALL-E 3',
    parameters: {
      prompt: { default: '' },
      size: { default: '1024x1024', enum: ['512x512', '1024x1024', '1536x1536'] },
    },
  }),
  createImageModel('midjourney', 'midjourney', {
    displayName: 'Midjourney',
  }),
];

const allModels = [...mockChatModels, ...mockImageModels];

describe('getModelListByType', () => {
  describe('Core Functionality', () => {
    it('should filter models by providerId and type correctly', async () => {
      const result = await getModelListByType(allModels, 'openai', 'chat');

      expect(result).toHaveLength(2);
      expect(result.map((m) => m.id)).toEqual(['gpt-4', 'gpt-3.5-turbo']);
    });

    it('should return correct model structure for chat models', async () => {
      const result = await getModelListByType(allModels, 'openai', 'chat');

      expect(result[0]).toEqual({
        abilities: { functionCall: true, files: true },
        contextWindowTokens: 8192,
        displayName: 'GPT-4',
        id: 'gpt-4',
      });
    });

    it('should include parameters field for image models', async () => {
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

    it('should exclude parameters field from chat models', async () => {
      const result = await getModelListByType(mockChatModels, 'openai', 'chat');

      result.forEach((model) => {
        expect(model).not.toHaveProperty('parameters');
      });
    });

    it('should remove duplicate model IDs', async () => {
      const duplicateModels = [
        createChatModel('gpt-4', 'openai', {
          displayName: 'GPT-4 Version 1',
          abilities: { functionCall: true } satisfies ModelAbilities,
        }),
        createChatModel('gpt-4', 'openai', {
          displayName: 'GPT-4 Version 2',
          abilities: { functionCall: false } satisfies ModelAbilities,
        }),
      ];

      const result = await getModelListByType(duplicateModels, 'openai', 'chat');

      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe('GPT-4 Version 1');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty inputs gracefully', async () => {
      const emptyResult = await getModelListByType([], 'openai', 'chat');
      expect(emptyResult).toEqual([]);

      const noMatchingProvider = await getModelListByType(allModels, 'nonexistent', 'chat');
      expect(noMatchingProvider).toEqual([]);

      const noMatchingType = await getModelListByType(allModels, 'openai', 'nonexistent');
      expect(noMatchingType).toEqual([]);
    });

    it('should handle missing optional properties', async () => {
      const modelWithMissingProps = createChatModel('test-model', 'test', {
        displayName: undefined,
        abilities: undefined,
        contextWindowTokens: undefined,
      });

      const result = await getModelListByType([modelWithMissingProps], 'test', 'chat');

      expect(result[0].displayName).toBe('');
      expect(result[0].abilities).toEqual({});
      expect(result[0].contextWindowTokens).toBeUndefined();
    });

    it('should preserve complex model properties', async () => {
      const complexModel = createChatModel('complex-model', 'test', {
        displayName: 'Complex Model with All Properties',
        abilities: {
          functionCall: true,
          files: true,
          vision: false,
        } satisfies ModelAbilities,
        contextWindowTokens: 128000,
      });

      const result = await getModelListByType([complexModel], 'test', 'chat');

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
  });

  describe('Image Model Parameter Handling', () => {
    it('should use fallback parameters for image models without parameters', async () => {
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

    it('should handle async parameter fetching for multiple models', async () => {
      const imageModelsWithoutParams = [
        createImageModel('stable-diffusion', 'stability', { displayName: 'Stable Diffusion' }),
        createImageModel('flux-schnell', 'fal', { displayName: 'FLUX Schnell' }),
      ];

      vi.spyOn(runtimeModule, 'getModelPropertyWithFallback').mockResolvedValue({
        prompt: { default: '' },
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
      });

      const result = await getModelListByType(imageModelsWithoutParams, 'stability', 'image');

      expect(result).toHaveLength(1);
      expect(result[0].parameters).toEqual({
        prompt: { default: '' },
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
      });

      expect(runtimeModule.getModelPropertyWithFallback).toHaveBeenCalledWith(
        'stable-diffusion',
        'parameters',
      );
    });

    it('should handle failed parameter fallback gracefully', async () => {
      const failingModel = createImageModel('failing-model', 'test-provider', {
        displayName: 'Failing Model',
      });

      vi.spyOn(runtimeModule, 'getModelPropertyWithFallback').mockResolvedValueOnce(undefined);

      const result = await getModelListByType([failingModel], 'test-provider', 'image');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('failing-model');
      expect(result[0].parameters).toBeUndefined();
    });
  });

  describe('Concurrent Processing', () => {
    it('should handle large-scale concurrent model processing', async () => {
      const manyModels = Array.from({ length: 10 }, (_, i) =>
        createChatModel(`model-${i}`, 'test-provider', {
          displayName: `Model ${i}`,
          abilities: { functionCall: i % 2 === 0 } satisfies ModelAbilities,
          contextWindowTokens: 4096 + i * 1000,
        }),
      );

      const result = await getModelListByType(manyModels, 'test-provider', 'chat');

      expect(result).toHaveLength(10);
      expect(result.map((m) => m.id)).toEqual(manyModels.map((m) => m.id));

      result.forEach((model, index) => {
        expect(model.abilities.functionCall).toBe(index % 2 === 0);
        expect(model.contextWindowTokens).toBe(4096 + index * 1000);
      });
    });

    it('should maintain model order during concurrent processing', async () => {
      const orderedModels = [
        createChatModel('first-model', 'test', { displayName: 'First Model' }),
        createChatModel('second-model', 'test', { displayName: 'Second Model' }),
        createChatModel('third-model', 'test', { displayName: 'Third Model' }),
      ];

      const result = await getModelListByType(orderedModels, 'test', 'chat');

      expect(result.map((m) => m.id)).toEqual(['first-model', 'second-model', 'third-model']);
    });
  });
});
