import { ModelParamsSchema } from 'model-bank';
import { describe, expect, it } from 'vitest';

import { calculateInitialAspectRatio, supportsVirtualAspectRatio } from './aspectRatio';

describe('aspectRatio utils', () => {
  describe('calculateInitialAspectRatio', () => {
    it('should return null for models with native aspectRatio parameter', () => {
      const schema: ModelParamsSchema = {
        aspectRatio: { default: '1:1', enum: ['1:1', '16:9', '4:3'] },
        prompt: { default: '' },
      };
      const defaultValues = { aspectRatio: '1:1', prompt: '' };

      const result = calculateInitialAspectRatio(schema, defaultValues);

      expect(result).toBeNull();
    });

    it('should return null for models with native size parameter', () => {
      const schema: ModelParamsSchema = {
        size: { default: '1024x1024', enum: ['512x512', '1024x1024', '1536x1536'] },
        prompt: { default: '' },
      };
      const defaultValues = { size: '1024x1024', prompt: '' };

      const result = calculateInitialAspectRatio(schema, defaultValues);

      expect(result).toBeNull();
    });

    it('should return null when width or height parameters are missing', () => {
      const schemaWithoutWidth: ModelParamsSchema = {
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };
      const defaultValuesWithoutWidth = { height: 512, prompt: '' };

      const result = calculateInitialAspectRatio(schemaWithoutWidth, defaultValuesWithoutWidth);

      expect(result).toBeNull();

      const schemaWithoutHeight: ModelParamsSchema = {
        width: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };
      const defaultValuesWithoutHeight = { width: 512, prompt: '' };

      const result2 = calculateInitialAspectRatio(schemaWithoutHeight, defaultValuesWithoutHeight);

      expect(result2).toBeNull();
    });

    it('should calculate aspect ratio from width and height values', () => {
      const schema: ModelParamsSchema = {
        width: { default: 1024, min: 256, max: 2048 },
        height: { default: 768, min: 256, max: 2048 },
        prompt: { default: '' },
      };
      const defaultValues = { width: 1024, height: 768, prompt: '' };

      const result = calculateInitialAspectRatio(schema, defaultValues);

      expect(result).toBe('1024:768');
    });

    it('should return 1:1 for square dimensions', () => {
      const schema: ModelParamsSchema = {
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };
      const defaultValues = { width: 512, height: 512, prompt: '' };

      const result = calculateInitialAspectRatio(schema, defaultValues);

      expect(result).toBe('512:512');
    });

    it('should return default fallback ratio when width/height values are invalid', () => {
      const schema: ModelParamsSchema = {
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      // Test with NaN values
      const invalidValues = { width: NaN, height: NaN, prompt: '' };
      const result = calculateInitialAspectRatio(schema, invalidValues);
      expect(result).toBe('1:1');

      // Test with zero values
      const zeroValues = { width: 0, height: 512, prompt: '' };
      const result2 = calculateInitialAspectRatio(schema, zeroValues);
      expect(result2).toBe('1:1');

      // Test with negative values
      const negativeValues = { width: -512, height: 512, prompt: '' };
      const result3 = calculateInitialAspectRatio(schema, negativeValues);
      expect(result3).toBe('1:1');
    });

    it('should handle missing width or height in default values', () => {
      const schema: ModelParamsSchema = {
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      const valuesWithoutWidth = { height: 512, prompt: '' };
      const result = calculateInitialAspectRatio(schema, valuesWithoutWidth);
      expect(result).toBe('1:1');

      const valuesWithoutHeight = { width: 512, prompt: '' };
      const result2 = calculateInitialAspectRatio(schema, valuesWithoutHeight);
      expect(result2).toBe('1:1');
    });
  });

  describe('supportsVirtualAspectRatio', () => {
    it('should return true for models with width and height but no native aspect ratio controls', () => {
      const schema: ModelParamsSchema = {
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(true);
    });

    it('should return false for models with native aspectRatio parameter', () => {
      const schema: ModelParamsSchema = {
        aspectRatio: { default: '1:1', enum: ['1:1', '16:9', '4:3'] },
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(false);
    });

    it('should return false for models with native size parameter', () => {
      const schema: ModelParamsSchema = {
        size: { default: '1024x1024', enum: ['512x512', '1024x1024', '1536x1536'] },
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(false);
    });

    it('should return false when width parameter is missing', () => {
      const schema: ModelParamsSchema = {
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(false);
    });

    it('should return false when height parameter is missing', () => {
      const schema: ModelParamsSchema = {
        width: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(false);
    });

    it('should return false when both width and height parameters are missing', () => {
      const schema: ModelParamsSchema = {
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(false);
    });

    it('should return false for models with both aspectRatio and size parameters', () => {
      const schema: ModelParamsSchema = {
        aspectRatio: { default: '1:1', enum: ['1:1', '16:9', '4:3'] },
        size: { default: '1024x1024', enum: ['512x512', '1024x1024', '1536x1536'] },
        width: { default: 512, min: 256, max: 2048 },
        height: { default: 512, min: 256, max: 2048 },
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(false);
    });

    it('should handle empty schema', () => {
      const schema: ModelParamsSchema = {
        prompt: { default: '' },
      };

      const result = supportsVirtualAspectRatio(schema);

      expect(result).toBe(false);
    });
  });
});
