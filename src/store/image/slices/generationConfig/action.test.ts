import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import FluxSchnellSchema from '@/config/paramsSchemas/fal/flux-schnell.json';
import { useImageStore } from '@/store/image';
import { StdImageGenParams } from '@/store/image/utils/StandardParameters';
// Update parseParamsSchema mock to handle different schemas
import { parseParamsSchema } from '@/store/image/utils/parseParamsSchema';
import { AIImageModelCard } from '@/types/aiModel';

// Mock parseParamsSchema to avoid module initialization errors
vi.mock('@/store/image/utils/parseParamsSchema', () => ({
  parseParamsSchema: vi.fn(() => ({
    defaultValues: {
      prompt: '',
      width: 1024,
      height: 1024,
      seed: null,
      steps: 4,
    },
    properties: FluxSchnellSchema.properties,
  })),
}));

// Based on real flux-schnell data
const fluxSchnellModel: AIImageModelCard = {
  id: 'flux/schnell',
  displayName: 'FLUX.1 Schnell',
  description:
    'FLUX.1 [schnell] is a 12 billion parameter stream transformer model that can generate high-quality images from text in 1 to 4 steps, suitable for personal and commercial use.',
  type: 'image',
  parameters: FluxSchnellSchema,
  releasedAt: '2024-08-01',
};

const fluxSchnellDefaultValues: Partial<StdImageGenParams> = {
  prompt: '',
  width: 1024,
  height: 1024,
  seed: null,
  steps: 4,
};

// Mock external dependencies to make getModelAndDefaults work properly
vi.mock('@/store/aiInfra', () => ({
  aiProviderSelectors: {
    enabledImageModelList: vi.fn(() => [
      {
        id: 'fal',
        name: 'Fal',
        children: [fluxSchnellModel],
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
              type: 'object',
              required: ['prompt'],
              properties: {
                prompt: { type: 'string', default: '' },
                width: { type: 'number', default: 1024, minimum: 256, maximum: 2048, step: 64 },
                height: { type: 'number', default: 1024, minimum: 256, maximum: 2048, step: 64 },
                customParam: { type: 'string', default: 'custom' },
              },
            },
            releasedAt: '2024-01-01',
          },
        ],
      },
    ]),
  },
  getAiInfraStoreState: vi.fn(() => ({})),
}));

const mockParseParamsSchema = vi.mocked(parseParamsSchema);

beforeEach(() => {
  vi.clearAllMocks();

  // Setup parseParamsSchema mock behavior
  mockParseParamsSchema.mockImplementation((schema: any) => {
    if (schema === FluxSchnellSchema) {
      return {
        defaultValues: fluxSchnellDefaultValues,
        properties: FluxSchnellSchema.properties,
      };
    }
    // Handle custom model schema
    if (schema?.properties?.customParam) {
      return {
        defaultValues: {
          prompt: '',
          width: 1024,
          height: 1024,
          customParam: 'custom',
        } as any,
        properties: schema.properties,
      };
    }
    // Default return
    return {
      defaultValues: fluxSchnellDefaultValues,
      properties: schema?.properties || {},
    };
  });

  // Reset store state
  useImageStore.setState({
    model: 'initial-model',
    provider: 'initial-provider',
    imageNum: 1,
    parameters: {
      prompt: 'initial prompt',
      width: 512,
      height: 512,
    },
    parameterSchema: {},
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

    it('should throw error when parameters is not initialized', async () => {
      const { result } = renderHook(() => useImageStore());

      // Set parameters to undefined
      act(() => {
        useImageStore.setState({ parameters: undefined });
      });

      expect(() => {
        act(() => {
          result.current.setParamOnInput('prompt', 'test');
        });
      }).toThrow('parameters is not initialized');
    });
  });

  describe('setModelAndProviderOnSelect', () => {
    it('should set model, provider, parameters and parameterSchema', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setModelAndProviderOnSelect('flux/schnell', 'fal');
      });

      expect(result.current.model).toBe('flux/schnell');
      expect(result.current.provider).toBe('fal');
      expect(result.current.parameters).toEqual(fluxSchnellDefaultValues);
      expect(result.current.parameterSchema).toEqual(FluxSchnellSchema);
    });

    it('should handle model selection with custom parameters', async () => {
      const { result } = renderHook(() => useImageStore());

      act(() => {
        result.current.setModelAndProviderOnSelect('custom-model', 'custom-provider');
      });

      expect(result.current.model).toBe('custom-model');
      expect(result.current.provider).toBe('custom-provider');
      expect(result.current.parameters).toMatchObject({
        prompt: '',
        width: 1024,
        height: 1024,
        customParam: 'custom',
      });
      expect(result.current.parameterSchema).toMatchObject({
        type: 'object',
        properties: {
          customParam: { type: 'string', default: 'custom' },
        },
      });
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
  });

  describe('reuseSettings', () => {
    it('should set model, provider and merge settings with default values', async () => {
      const { result } = renderHook(() => useImageStore());
      const customSettings: Partial<StdImageGenParams> = {
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
      expect(result.current.parameterSchema).toEqual(FluxSchnellSchema);
    });

    it('should override default values with provided settings', async () => {
      const { result } = renderHook(() => useImageStore());
      const customSettings: Partial<StdImageGenParams> = {
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
  });
});
