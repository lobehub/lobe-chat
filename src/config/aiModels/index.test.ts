import { describe, expect, it } from 'vitest';

import { type AiFullModelCard } from '@/types/aiModel';

import { LOBE_DEFAULT_MODEL_LIST } from './index';

// Helper function to avoid TS error since buildDefaultModelList is not exported
const buildDefaultModelList = (map: Record<string, AiFullModelCard[]>) => {
  let models: any[] = [];
  Object.entries(map).forEach(([provider, providerModels]) => {
    const newModels = providerModels.map((model) => ({
      ...model,
      abilities: model.abilities ?? {},
      enabled: model.enabled || false,
      providerId: provider,
      source: 'builtin',
    }));
    models = models.concat(newModels);
  });
  return models;
};

describe('buildDefaultModelList', () => {
  it('should transform model map into list format', () => {
    const mockModels: Record<string, AiFullModelCard[]> = {
      provider1: [
        {
          id: 'model1',
          type: 'chat',
          displayName: 'Model 1',
        },
        {
          id: 'model2',
          type: 'chat',
          displayName: 'Model 2',
          abilities: {
            vision: true,
          },
        },
      ],
      provider2: [
        {
          id: 'model3',
          type: 'chat',
          enabled: true,
        },
      ],
    };

    const result = buildDefaultModelList(mockModels);

    expect(result).toEqual([
      {
        id: 'model1',
        type: 'chat',
        displayName: 'Model 1',
        abilities: {},
        enabled: false,
        providerId: 'provider1',
        source: 'builtin',
      },
      {
        id: 'model2',
        type: 'chat',
        displayName: 'Model 2',
        abilities: {
          vision: true,
        },
        enabled: false,
        providerId: 'provider1',
        source: 'builtin',
      },
      {
        id: 'model3',
        type: 'chat',
        enabled: true,
        abilities: {},
        providerId: 'provider2',
        source: 'builtin',
      },
    ]);
  });

  it('should preserve model properties in default list', () => {
    const result = LOBE_DEFAULT_MODEL_LIST;

    result.forEach((model) => {
      expect(model).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: expect.any(String),
          abilities: expect.any(Object),
          enabled: expect.any(Boolean),
          providerId: expect.any(String),
          source: 'builtin',
        }),
      );
    });
  });

  it('should have valid provider IDs in default list', () => {
    const result = LOBE_DEFAULT_MODEL_LIST;
    result.forEach((model) => {
      expect(model.providerId).toBeTruthy();
      expect(typeof model.providerId).toBe('string');
    });
  });

  it('should handle empty model arrays', () => {
    const mockModels: Record<string, AiFullModelCard[]> = {
      provider1: [],
      provider2: [],
    };

    const result = buildDefaultModelList(mockModels);
    expect(result).toEqual([]);
  });

  it('should set default abilities if not provided', () => {
    const mockModels: Record<string, AiFullModelCard[]> = {
      provider1: [
        {
          id: 'model1',
          type: 'chat',
        },
      ],
    };

    const result = buildDefaultModelList(mockModels);
    expect(result[0].abilities).toEqual({});
  });
});
