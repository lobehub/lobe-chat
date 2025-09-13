import { describe, expect, it, vi } from 'vitest';
import { AiFullModelCard } from 'model-bank';

import { filterEnabledModels, getEnabledModels, isModelDisabled } from './modelValidation';

// Mock the global config
const mockServerConfig = {
  aiProvider: {
    openai: {
      serverModelLists: [
        { id: 'gpt-4', displayName: 'GPT-4' },
        { id: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' },
      ] as AiFullModelCard[],
    },
    anthropic: {
      serverModelLists: undefined, // No restrictions
    },
  },
};

// Mock the getServerGlobalConfig function
vi.mock('../globalConfig', () => ({
  getServerGlobalConfig: vi.fn(() => Promise.resolve(mockServerConfig)),
}));

describe('modelValidation', () => {
  describe('isModelDisabled', () => {
    it('should return true for models not in serverModelLists', async () => {
      const result = await isModelDisabled('gpt-4-turbo', 'openai');
      expect(result).toBe(true);
    });

    it('should return false for models in serverModelLists', async () => {
      const result = await isModelDisabled('gpt-4', 'openai');
      expect(result).toBe(false);
    });

    it('should return false when serverModelLists is not configured', async () => {
      const result = await isModelDisabled('claude-3', 'anthropic');
      expect(result).toBe(false);
    });

    it('should return false for unknown provider', async () => {
      const result = await isModelDisabled('some-model', 'unknown-provider');
      expect(result).toBe(false);
    });
  });

  describe('getEnabledModels', () => {
    it('should return model IDs from serverModelLists', async () => {
      const result = await getEnabledModels('openai');
      expect(result).toEqual(['gpt-4', 'gpt-3.5-turbo']);
    });

    it('should return empty array when serverModelLists is not configured', async () => {
      const result = await getEnabledModels('anthropic');
      expect(result).toEqual([]);
    });

    it('should return empty array for unknown provider', async () => {
      const result = await getEnabledModels('unknown-provider');
      expect(result).toEqual([]);
    });
  });

  describe('filterEnabledModels', () => {
    const sampleModels = [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ];

    it('should filter out disabled models when serverModelLists is configured', async () => {
      const result = await filterEnabledModels(sampleModels, 'openai');
      expect(result).toEqual([
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      ]);
    });

    it('should return all models when serverModelLists is not configured', async () => {
      const result = await filterEnabledModels(sampleModels, 'anthropic');
      expect(result).toEqual(sampleModels);
    });

    it('should work with custom model ID field', async () => {
      const modelsWithCustomField = [
        { modelId: 'gpt-4', name: 'GPT-4' },
        { modelId: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      ];
      
      const result = await filterEnabledModels(modelsWithCustomField, 'openai', 'modelId');
      expect(result).toEqual([
        { modelId: 'gpt-4', name: 'GPT-4' },
      ]);
    });
  });
});