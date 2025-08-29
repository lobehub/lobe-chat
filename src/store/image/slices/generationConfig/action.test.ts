import { act, renderHook } from '@testing-library/react';
import { ModelParamsSchema, RuntimeImageGenParams, extractDefaultValues } from 'model-bank';
import { fluxSchnellParamsSchema } from 'model-bank';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useImageStore } from '@/store/image';
import { AIImageModelCard } from '@/types/aiModel';

// Mock external dependencies
vi.mock('@/store/aiInfra', () => ({
  aiProviderSelectors: {
    enabledImageModelList: vi.fn(() => [
      {
        id: 'fal',
        name: 'Fal',
        children: [
          {
            id: 'flux/schnell',
            displayName: 'FLUX.1 Schnell',
            type: 'image',
            parameters: fluxSchnellParamsSchema,
            releasedAt: '2024-08-01',
          } as AIImageModelCard,
        ],
      },
      {
        id: 'custom-provider',
        name: 'Custom Provider',
        children: [
          {
            id: 'custom-model',
            displayName: 'Custom Model',
            type: 'image',
            parameters: {
              prompt: { default: '' },
              width: { default: 1024, min: 256, max: 2048, step: 64 },
              height: { default: 1024, min: 256, max: 2048, step: 64 },
              steps: { default: 20, min: 1, max: 50 },
            } as ModelParamsSchema,
            releasedAt: '2024-01-01',
          } as AIImageModelCard,
        ],
      },
    ]),
  },
  getAiInfraStoreState: vi.fn(() => ({})),
}));

const fluxSchnellDefaultValues = extractDefaultValues(fluxSchnellParamsSchema);

const customModelSchema: ModelParamsSchema = {
  prompt: { default: '' },
  width: { default: 1024, min: 256, max: 2048, step: 64 },
  height: { default: 1024, min: 256, max: 2048, step: 64 },
  steps: { default: 20, min: 1, max: 50 },
};

beforeEach(() => {
  vi.clearAllMocks();

  // Reset store state
  useImageStore.setState({
    model: 'initial-model',
    provider: 'initial-provider',
    imageNum: 1,
    parameters: {
      prompt: 'initial prompt',
      width: 512,
      height: 512,
    } as RuntimeImageGenParams,
    parametersSchema: {
      prompt: { default: '' },
      width: { default: 512, min: 256, max: 1024 },
      height: { default: 512, min: 256, max: 1024 },
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GenerationConfigAction', () => {
  describe('setParamOnInput', () => {
    it('should update a single parameter in the parameters object', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setParamOnInput('prompt', 'new test prompt');
      });

      expect(result.current.parameters).toMatchObject({
        prompt: 'new test prompt',
        width: 512,
        height: 512,
      });
    });

    it('should update numeric parameters correctly', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setParamOnInput('width', 2048);
      });

      expect(result.current.parameters).toMatchObject({
        prompt: 'initial prompt',
        width: 2048,
        height: 512,
      });
    });

    it('should handle null values correctly', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setParamOnInput('seed', null);
      });

      expect(result.current.parameters?.seed).toBeNull();
    });

    it('should handle array values correctly', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setParamOnInput('imageUrls', ['test1.jpg', 'test2.jpg']);
      });

      expect(result.current.parameters?.imageUrls).toEqual(['test1.jpg', 'test2.jpg']);
    });
  });

  describe('setModelAndProviderOnSelect', () => {
    it('should set model, provider, parameters and parametersSchema for flux/schnell', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setModelAndProviderOnSelect('flux/schnell', 'fal');
      });

      expect(result.current.model).toBe('flux/schnell');
      expect(result.current.provider).toBe('fal');
      expect(result.current.parameters).toEqual(fluxSchnellDefaultValues);
      expect(result.current.parametersSchema).toEqual(fluxSchnellParamsSchema);
    });

    it('should handle model selection with custom parameters', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setModelAndProviderOnSelect('custom-model', 'custom-provider');
      });

      const expectedParams = extractDefaultValues(customModelSchema);

      expect(result.current.model).toBe('custom-model');
      expect(result.current.provider).toBe('custom-provider');
      expect(result.current.parameters).toEqual(expectedParams);
      expect(result.current.parametersSchema).toEqual(customModelSchema);
    });

    it('should replace all previous parameters with new model defaults', async () => {
      const { result } = renderHook(() => useImageStore());

      // First set some custom parameters
      act(() => {
        result.current.setParamOnInput('prompt', 'custom prompt');
        result.current.setParamOnInput('steps', 50);
      });

      // Then switch model
      act(() => {
        result.current.setModelAndProviderOnSelect('flux/schnell', 'fal');
      });

      // Should completely replace parameters with model defaults
      expect(result.current.parameters).toEqual(fluxSchnellDefaultValues);
      expect(result.current.parameters?.prompt).toBe(''); // Default value, not 'custom prompt'
    });
  });

  describe('setImageNum', () => {
    it('should update the imageNum value', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setImageNum(4);
      });

      expect(result.current.imageNum).toBe(4);
    });

    it('should handle different imageNum values', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setImageNum(8);
      });

      expect(result.current.imageNum).toBe(8);

      act(() => {
        result.current.setImageNum(1);
      });

      expect(result.current.imageNum).toBe(1);
    });

    it('should handle edge case values', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setImageNum(0);
      });

      expect(result.current.imageNum).toBe(0);
    });
  });

  describe('reuseSettings', () => {
    it('should set model, provider and merge settings with default values', async () => {
      const { result } = renderHook(() => useImageStore());
      const customSettings: Partial<RuntimeImageGenParams> = {
        prompt: 'custom prompt',
        steps: 8,
        seed: 54321,
      };

      act(() => {
        result.current.reuseSettings('flux/schnell', 'fal', customSettings);
      });

      expect(result.current.model).toBe('flux/schnell');
      expect(result.current.provider).toBe('fal');
      expect(result.current.parameters).toEqual({
        ...fluxSchnellDefaultValues,
        ...customSettings,
      });
      expect(result.current.parametersSchema).toEqual(fluxSchnellParamsSchema);
    });

    it('should override default values with provided settings', async () => {
      const { result } = renderHook(() => useImageStore());
      const customSettings: Partial<RuntimeImageGenParams> = {
        width: 1536,
        height: 1536,
      };

      act(() => {
        result.current.reuseSettings('flux/schnell', 'fal', customSettings);
      });

      expect(result.current.parameters).toEqual({
        ...fluxSchnellDefaultValues,
        width: 1536,
        height: 1536,
      });
    });

    it('should handle empty settings object', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.reuseSettings('flux/schnell', 'fal', {});
      });

      expect(result.current.parameters).toEqual(fluxSchnellDefaultValues);
    });

    it('should handle partial settings with null values', async () => {
      const { result } = renderHook(() => useImageStore());
      const customSettings: Partial<RuntimeImageGenParams> = {
        seed: null,
        imageUrl: null,
      };

      act(() => {
        result.current.reuseSettings('flux/schnell', 'fal', customSettings);
      });

      expect(result.current.parameters?.seed).toBeNull();
      expect(result.current.parameters?.imageUrl).toBeNull();
    });
  });

  describe('reuseSeed', () => {
    it('should update only the seed parameter', async () => {
      const { result } = renderHook(() => useImageStore());
      const newSeed = 98765;

      act(() => {
        result.current.reuseSeed(newSeed);
      });

      expect(result.current.parameters).toMatchObject({
        prompt: 'initial prompt',
        width: 512,
        height: 512,
        seed: newSeed,
      });
    });

    it('should preserve other parameters when updating seed', async () => {
      const { result } = renderHook(() => useImageStore());

      // First set some parameters
      act(() => {
        result.current.setParamOnInput('prompt', 'test prompt');
        result.current.setParamOnInput('width', 1024);
      });

      const newSeed = 11111;
      act(() => {
        result.current.reuseSeed(newSeed);
      });

      expect(result.current.parameters).toMatchObject({
        prompt: 'test prompt',
        width: 1024,
        height: 512,
        seed: newSeed,
      });
    });

    it('should handle seed value of 0', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.reuseSeed(0);
      });

      expect(result.current.parameters?.seed).toBe(0);
    });

    it('should handle large seed values within range', async () => {
      const { result } = renderHook(() => useImageStore());
      const largeSeed = 2147483647; // MAX_SEED

      act(() => {
        result.current.reuseSeed(largeSeed);
      });

      expect(result.current.parameters?.seed).toBe(largeSeed);
    });
  });
});
