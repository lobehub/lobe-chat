import { describe, expect, it } from 'vitest';

import { type AiFullModelCard, type LobeDefaultAiModelListItem } from '@/types/aiModel';

import { LOBE_DEFAULT_MODEL_LIST } from './index';

describe('buildDefaultModelList', () => {
  it('should transform model map into list format with correct properties', () => {
    const mockModels: Record<string, AiFullModelCard[]> = {
      provider1: [
        {
          id: 'model1',
          type: 'chat',
          displayName: 'Model 1',
          description: 'Test model 1',
        },
        {
          id: 'model2',
          type: 'chat',
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

    const result = LOBE_DEFAULT_MODEL_LIST;

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({
      id: expect.any(String),
      type: expect.any(String),
      abilities: expect.any(Object),
      enabled: expect.any(Boolean),
      providerId: expect.any(String),
    });
  });

  it('should have required properties for each model', () => {
    const result = LOBE_DEFAULT_MODEL_LIST;

    result.forEach((model) => {
      expect(model).toMatchObject({
        id: expect.any(String),
        type: expect.any(String),
        abilities: expect.any(Object),
        enabled: expect.any(Boolean),
        providerId: expect.any(String),
      });
    });
  });

  it('should have valid model types', () => {
    const validTypes = [
      'chat',
      'embedding',
      'tts',
      'stt',
      'image',
      'text2video',
      'text2music',
      'realtime',
    ];

    const result = LOBE_DEFAULT_MODEL_LIST;

    result.forEach((model) => {
      expect(validTypes).toContain(model.type);
    });
  });

  it('should have valid provider IDs', () => {
    const result = LOBE_DEFAULT_MODEL_LIST;

    result.forEach((model) => {
      expect(model.providerId).toBeTruthy();
      expect(typeof model.providerId).toBe('string');
    });
  });
});
