import { describe, expect, it, vi } from 'vitest';

import { fluxSchnellParamsDefinition } from '@/config/paramsSchemas/fal/flux-schnell';
import {
  ModelParamsDefinition,
  RuntimeImageGenParams,
} from '@/libs/standard-parameters/meta-schema';
import { ImageStore } from '@/store/image';
import { initialState } from '@/store/image/initialState';
import { AIImageModelCard } from '@/types/aiModel';
import { merge } from '@/utils/merge';

import { imageGenerationConfigSelectors } from './selectors';

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
            parameters: fluxSchnellParamsDefinition,
            releasedAt: '2024-08-01',
          } as AIImageModelCard,
        ],
      },
    ]),
  },
  getAiInfraStoreState: vi.fn(() => ({})),
}));

const initialStore = initialState as ImageStore;

const testModelDefinition: ModelParamsDefinition = {
  prompt: { default: '' },
  width: { default: 1024, min: 512, max: 2048, step: 64 },
  height: { default: 1024, min: 512, max: 2048, step: 64 },
  steps: { default: 20, min: 1, max: 50 },
  seed: { default: null, min: 0 },
  cfg: { default: 7.5, min: 1, max: 20, step: 0.5 },
};

const testParameters: RuntimeImageGenParams = {
  prompt: 'test prompt',
  width: 1024,
  height: 768,
  steps: 25,
  seed: 12345,
  cfg: 8.0,
};

describe('imageGenerationConfigSelectors', () => {
  describe('model', () => {
    it('should return the current model', () => {
      const state = merge(initialStore, { model: 'flux/schnell' });
      const result = imageGenerationConfigSelectors.model(state);
      expect(result).toBe('flux/schnell');
    });

    it('should return the default model from initial state', () => {
      const result = imageGenerationConfigSelectors.model(initialStore);
      expect(result).toBe('flux/schnell'); // Default model from initialState
    });
  });

  describe('provider', () => {
    it('should return the current provider', () => {
      const state = merge(initialStore, { provider: 'fal' });
      const result = imageGenerationConfigSelectors.provider(state);
      expect(result).toBe('fal');
    });

    it('should return the default provider from initial state', () => {
      const result = imageGenerationConfigSelectors.provider(initialStore);
      expect(result).toBe('fal'); // Default provider from initialState
    });
  });

  describe('imageNum', () => {
    it('should return the current imageNum', () => {
      const state = merge(initialStore, { imageNum: 4 });
      const result = imageGenerationConfigSelectors.imageNum(state);
      expect(result).toBe(4);
    });

    it('should return default imageNum when not set', () => {
      const state = merge(initialStore, { imageNum: 1 });
      const result = imageGenerationConfigSelectors.imageNum(state);
      expect(result).toBe(1);
    });

    it('should handle different imageNum values', () => {
      const state = merge(initialStore, { imageNum: 8 });
      const result = imageGenerationConfigSelectors.imageNum(state);
      expect(result).toBe(8);
    });
  });

  describe('parameters', () => {
    it('should return the current parameters', () => {
      const state = merge(initialStore, { parameters: testParameters });
      const result = imageGenerationConfigSelectors.parameters(state);
      expect(result).toEqual(testParameters);
    });

    it('should return the default parameters from initial state', () => {
      const result = imageGenerationConfigSelectors.parameters(initialStore);
      expect(result).toBeDefined();
      expect(typeof result.prompt).toBe('string');
    });

    it('should handle custom parameters object', () => {
      const customParams = { prompt: 'custom', width: 2048 } as RuntimeImageGenParams;
      const state = merge(initialStore, { parameters: customParams });
      const result = imageGenerationConfigSelectors.parameters(state);
      expect(result.prompt).toBe('custom');
      expect(result.width).toBe(2048);
    });
  });

  describe('parametersDefinition', () => {
    it('should return the current parametersDefinition', () => {
      const state = merge(initialStore, { parametersDefinition: testModelDefinition });
      const result = imageGenerationConfigSelectors.parametersDefinition(state);
      expect(result).toEqual(testModelDefinition);
    });

    it('should return default parametersDefinition when not explicitly overridden', () => {
      // merge function doesn't override with undefined, so we get the default from initialState
      const result = imageGenerationConfigSelectors.parametersDefinition(initialStore);
      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
    });

    it('should handle parametersDefinition deep merge', () => {
      const customDefinition: ModelParamsDefinition = {
        prompt: { default: 'custom prompt' },
        width: { default: 512, min: 256, max: 1024 },
      };
      const state = merge(initialStore, { parametersDefinition: customDefinition });
      const result = imageGenerationConfigSelectors.parametersDefinition(state);

      // merge function does deep merge, so we should expect merged result
      expect(result.prompt.default).toBe('custom prompt');
      expect(result.width?.default).toBe(512);
      expect(result.width?.min).toBe(256);
      expect(result.width?.max).toBe(1024);
      // Original keys should still exist
      expect(result.height).toBeDefined();
      expect(result.steps).toBeDefined();
    });
  });

  describe('isSupportParam', () => {
    it('should return true when parameter exists in parametersDefinition', () => {
      const state = merge(initialStore, { parametersDefinition: testModelDefinition });
      const result = imageGenerationConfigSelectors.isSupportedParam('width')(state);
      expect(result).toBe(true);
    });

    it('should return false when parameter does not exist in parametersDefinition', () => {
      const state = merge(initialStore, { parametersDefinition: testModelDefinition });
      const result = imageGenerationConfigSelectors.isSupportedParam('nonexistent' as any)(state);
      expect(result).toBe(false);
    });

    it('should return true for supported params in default parametersDefinition', () => {
      // Since merge doesn't override with undefined, we get the default parametersDefinition from initialState
      const result = imageGenerationConfigSelectors.isSupportedParam('prompt')(initialStore);
      expect(result).toBe(true);
    });

    it('should return false when parameter does not exist in merged parametersDefinition', () => {
      // Since merge does deep merge, original params still exist, so test a param that truly doesn't exist
      const result = imageGenerationConfigSelectors.isSupportedParam('nonExistentParam' as any)(
        initialStore,
      );
      expect(result).toBe(false);
    });

    it('should handle various parameter types', () => {
      const state = merge(initialStore, { parametersDefinition: testModelDefinition });

      expect(imageGenerationConfigSelectors.isSupportedParam('prompt')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportedParam('width')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportedParam('height')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportedParam('steps')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportedParam('seed')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportedParam('cfg')(state)).toBe(true);
    });

    it('should work correctly with flux/schnell parameters', () => {
      const state = merge(initialStore, { parametersDefinition: fluxSchnellParamsDefinition });

      // Test some known flux/schnell parameters
      expect(imageGenerationConfigSelectors.isSupportedParam('prompt')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportedParam('width')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportedParam('height')(state)).toBe(true);

      // Test parameter that doesn't exist
      expect(imageGenerationConfigSelectors.isSupportedParam('nonexistent' as any)(state)).toBe(
        false,
      );
    });
  });
});
