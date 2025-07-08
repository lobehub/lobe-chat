import { describe, expect, it, vi } from 'vitest';

import FluxSchnellSchema from '@/config/paramsSchemas/fal/flux-schnell.json';
import { merge } from '@/utils/merge';

import { StdImageGenParamsKeys } from '../../../../libs/standard-parameters/image';
import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { GenerationConfigState, initialGenerationConfigState } from './initialState';
import { imageGenerationConfigSelectors } from './selectors';

const initialState = initialGenerationConfigState as GenerationConfigState;

describe('imageGenerationConfigSelectors', () => {
  describe('model', () => {
    it('should return the model from state', () => {
      const testModel = 'test-model';
      const state = merge(initialState, { model: testModel });

      const result = imageGenerationConfigSelectors.model(state);
      expect(result).toBe(testModel);
    });

    it('should return default model from initial state', () => {
      const result = imageGenerationConfigSelectors.model(initialState);
      expect(result).toBe(initialState.model);
    });
  });

  describe('provider', () => {
    it('should return the provider from state', () => {
      const testProvider = 'test-provider';
      const state = merge(initialState, { provider: testProvider });

      const result = imageGenerationConfigSelectors.provider(state);
      expect(result).toBe(testProvider);
    });

    it('should return default provider from initial state', () => {
      const result = imageGenerationConfigSelectors.provider(initialState);
      expect(result).toBe(initialState.provider);
    });
  });

  describe('imageNum', () => {
    it('should return the imageNum from state', () => {
      const testImageNum = 6;
      const state = merge(initialState, { imageNum: testImageNum });

      const result = imageGenerationConfigSelectors.imageNum(state);
      expect(result).toBe(testImageNum);
    });

    it('should return default imageNum from initial state', () => {
      const result = imageGenerationConfigSelectors.imageNum(initialState);
      expect(result).toBe(initialState.imageNum);
    });
  });

  describe('parameters', () => {
    it('should return the parameters from state', () => {
      const testParameters = { prompt: 'test prompt', width: 512, height: 512 };
      // Use spread operator instead of merge to avoid deep merging
      const state = { ...initialState, parameters: testParameters };

      const result = imageGenerationConfigSelectors.parameters(state);
      expect(result).toEqual(testParameters);
    });

    it('should return undefined if parameters not set', () => {
      // Create a state object without parameters directly
      const state = { ...initialState, parameters: undefined };

      const result = imageGenerationConfigSelectors.parameters(state);
      expect(result).toBeUndefined();
    });

    it('should return default parameters from initial state', () => {
      const result = imageGenerationConfigSelectors.parameters(initialState);
      expect(result).toBe(initialState.parameters);
    });
  });

  describe('paramsSchema', () => {
    it('should return the parameterSchema from state', () => {
      const testSchema = {
        type: 'object',
        properties: { prompt: { type: 'string', default: '' } },
        required: ['prompt'],
      };
      // Create state object directly to avoid merge's deep merging behavior
      const state = { ...initialState, parameterSchema: testSchema };

      const result = imageGenerationConfigSelectors.paramsSchema(state);
      expect(result).toEqual(testSchema);
    });

    it('should return undefined if parameterSchema not set', () => {
      // Create a state object without parameterSchema directly
      const state = { ...initialState, parameterSchema: undefined };

      const result = imageGenerationConfigSelectors.paramsSchema(state);
      expect(result).toBeUndefined();
    });

    it('should return default parameterSchema from initial state', () => {
      const result = imageGenerationConfigSelectors.paramsSchema(initialState);
      expect(result).toBe(initialState.parameterSchema);
      // Verify default schema is FluxSchnellSchema
      expect(result).toEqual(FluxSchnellSchema);
    });
  });

  describe('paramsProperties', () => {
    it('should return parsed properties when parameterSchema exists', () => {
      // Use custom schema, parseParamsSchema will add default values
      const testSchema = {
        type: 'object',
        properties: {
          prompt: { type: 'string', default: 'test prompt' },
          width: { type: 'number', default: 512, minimum: 256, maximum: 1024 },
        },
        required: ['prompt'],
      };

      const state = { ...initialState, parameterSchema: testSchema };
      const result = imageGenerationConfigSelectors.paramsProperties(state);

      // Verify that parsed properties are returned
      // parseParamsSchema adds default step: 1 for number types
      expect(result).toEqual({
        prompt: { type: 'string', default: 'test prompt' },
        width: { type: 'number', default: 512, minimum: 256, maximum: 1024, step: 1 },
      });
    });

    it('should return parsed FluxSchnellSchema properties from initial state', () => {
      const result = imageGenerationConfigSelectors.paramsProperties(initialState);

      // Verify FluxSchnellSchema properties are returned
      expect(result).toBeDefined();
      expect(result).toHaveProperty('prompt');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('seed');

      // Verify specific property values
      expect(result?.width).toEqual({
        minimum: 512,
        maximum: 1536,
        step: 1,
        default: 1024,
      });
      expect(result?.height).toEqual({
        minimum: 512,
        maximum: 1536,
        step: 1,
        default: 1024,
      });
      expect(result?.steps).toEqual({
        minimum: 1,
        maximum: 12,
        default: 4,
        step: 1, // parseParamsSchema automatically adds default step
      });
      expect(result?.seed).toEqual({
        default: null,
        minimum: 0,
        maximum: 2147483647, // parseParamsSchema adds default MAX_SEED value for seed
      });
    });

    it('should return undefined when parameterSchema is undefined', () => {
      const state = { ...initialState, parameterSchema: undefined };

      const result = imageGenerationConfigSelectors.paramsProperties(state);

      expect(result).toBeUndefined();
    });

    it('should return undefined when parameterSchema is null', () => {
      const state = { ...initialState, parameterSchema: null as any };

      const result = imageGenerationConfigSelectors.paramsProperties(state);

      expect(result).toBeUndefined();
    });
  });

  describe('isSupportParam', () => {
    it('should return true when parameter is supported in FluxSchnellSchema', () => {
      // Test parameters supported by FluxSchnellSchema
      const supportedParams: StdImageGenParamsKeys[] = [
        'prompt',
        'width',
        'height',
        'steps',
        'seed',
      ];

      supportedParams.forEach((param) => {
        const isSupportParam = imageGenerationConfigSelectors.isSupportParam(param);
        const result = isSupportParam(initialState);
        expect(result).toBe(true);
      });
    });

    it('should return false when parameter is not supported in FluxSchnellSchema', () => {
      // Test parameters not supported by FluxSchnellSchema
      const unsupportedParams: StdImageGenParamsKeys[] = [
        'imageUrl',
        'imageUrls',
        'aspectRatio',
        'cfg',
        'size',
      ];

      unsupportedParams.forEach((param) => {
        const isSupportParam = imageGenerationConfigSelectors.isSupportParam(param);
        const result = isSupportParam(initialState);
        expect(result).toBe(false);
      });
    });

    it('should work with custom schema', () => {
      const customSchema = {
        type: 'object',
        properties: {
          prompt: {},
          aspectRatio: {
            default: '1:1',
            enum: ['1:1', '16:9', '4:3'],
          },
          cfg: {
            type: 'number',
            default: 7,
            minimum: 1,
            maximum: 20,
            step: 0.1, // Need to provide step to satisfy Zod validation
          },
        },
        required: ['prompt'],
      };

      const state = { ...initialState, parameterSchema: customSchema };

      // Verify parameters supported by custom schema
      expect(imageGenerationConfigSelectors.isSupportParam('prompt')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportParam('aspectRatio')(state)).toBe(true);
      expect(imageGenerationConfigSelectors.isSupportParam('cfg')(state)).toBe(true);

      // Verify parameters not supported by custom schema
      expect(imageGenerationConfigSelectors.isSupportParam('width')(state)).toBe(false);
      expect(imageGenerationConfigSelectors.isSupportParam('height')(state)).toBe(false);
    });

    it('should return false when paramsProperties is undefined', () => {
      const state = { ...initialState, parameterSchema: undefined };

      const isSupportPrompt = imageGenerationConfigSelectors.isSupportParam('prompt');
      const result = isSupportPrompt(state);

      expect(result).toBe(false);
    });

    it('should return false when parameterSchema has invalid structure', () => {
      // Test invalid schema structure
      const invalidSchema = {
        type: 'object',
        // Missing properties and required fields, will cause Zod validation to fail
      };

      const state = { ...initialState, parameterSchema: invalidSchema };

      // Selector gracefully handles parseParamsSchema errors, returns undefined
      const isSupportPrompt = imageGenerationConfigSelectors.isSupportParam('prompt');
      const result = isSupportPrompt(state);

      // When paramsProperties returns undefined, isSupportParam should return false
      expect(result).toBe(false);
    });
  });
});
