import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Generation, GenerationBatch } from '@/types/generation';

import {
  DEFAULT_MAX_ITEM_WIDTH,
  getAspectRatio,
  getImageDimensions,
  getThumbnailMaxWidth,
} from './utils';

describe('getImageDimensions', () => {
  // Mock base generation object
  const baseGeneration: Generation = {
    id: 'test-gen-id',
    seed: 12345,
    createdAt: new Date(),
    asyncTaskId: null,
    task: {
      id: 'task-id',
      status: 'success' as any,
    },
  };

  describe('with asset dimensions', () => {
    it('should return width, height and aspect ratio from asset', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 1920,
          height: 1080,
        },
      };

      const result = getImageDimensions(generation);
      expect(result).toEqual({
        width: 1920,
        height: 1080,
        aspectRatio: '1920 / 1080',
      });
    });

    it('should prioritize asset even when other sources exist', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 800,
          height: 600,
        },
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        width: 1024,
        height: 1024,
        config: {
          prompt: 'test',
          width: 512,
          height: 512,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: 800,
        height: 600,
        aspectRatio: '800 / 600',
      });
    });
  });

  describe('with config dimensions', () => {
    it('should return dimensions from config when asset is not available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          width: 1024,
          height: 768,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: 1024,
        height: 768,
        aspectRatio: '1024 / 768',
      });
    });
  });

  describe('with batch top-level dimensions', () => {
    it('should return dimensions from batch when config is not available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        width: 1280,
        height: 720,
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: 1280,
        height: 720,
        aspectRatio: '1280 / 720',
      });
    });
  });

  describe('with size parameter', () => {
    it('should parse dimensions from size parameter', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: '1920x1080',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: 1920,
        height: 1080,
        aspectRatio: '1920 / 1080',
      });
    });

    it('should ignore size when it is "auto"', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: 'auto',
          aspectRatio: '16:9',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: null,
        height: null,
        aspectRatio: '16 / 9',
      });
    });
  });

  describe('with aspectRatio parameter only', () => {
    it('should return aspect ratio without dimensions', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          aspectRatio: '16:9',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: null,
        height: null,
        aspectRatio: '16 / 9',
      });
    });

    it('should handle various aspect ratio formats', () => {
      const testCases = [
        { aspectRatio: '1:1', expected: '1 / 1' },
        { aspectRatio: '4:3', expected: '4 / 3' },
        { aspectRatio: '16:9', expected: '16 / 9' },
        { aspectRatio: '21:9', expected: '21 / 9' },
      ];

      testCases.forEach(({ aspectRatio, expected }) => {
        const generation: Generation = {
          ...baseGeneration,
          asset: null,
        };

        const generationBatch: GenerationBatch = {
          id: 'batch-id',
          provider: 'test',
          model: 'test-model',
          prompt: 'test prompt',
          config: {
            prompt: 'test',
            aspectRatio,
          },
          createdAt: new Date(),
          generations: [],
        };

        const result = getImageDimensions(generation, generationBatch);
        expect(result.aspectRatio).toBe(expected);
      });
    });
  });

  describe('edge cases', () => {
    it('should return all null when no dimensions are available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const result = getImageDimensions(generation);
      expect(result).toEqual({
        width: null,
        height: null,
        aspectRatio: null,
      });
    });

    it('should handle partial asset dimensions', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 1920,
          // height is missing
        },
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          width: 1024,
          height: 768,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: 1024,
        height: 768,
        aspectRatio: '1024 / 768',
      });
    });

    it('should handle invalid size format', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: 'invalid-format',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: null,
        height: null,
        aspectRatio: null,
      });
    });

    it('should handle invalid aspectRatio format', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          aspectRatio: 'invalid-format',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getImageDimensions(generation, generationBatch);
      expect(result).toEqual({
        width: null,
        height: null,
        aspectRatio: null,
      });
    });

    it('should handle zero dimensions', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 0,
          height: 0,
        },
      };

      const result = getImageDimensions(generation);
      expect(result).toEqual({
        width: null,
        height: null,
        aspectRatio: null,
      });
    });
  });
});

describe('getAspectRatio', () => {
  // Mock base generation object
  const baseGeneration: Generation = {
    id: 'test-gen-id',
    seed: 12345,
    createdAt: new Date(),
    asyncTaskId: null,
    task: {
      id: 'task-id',
      status: 'success' as any,
    },
  };

  describe('Priority 1: asset width and height', () => {
    it('should use asset dimensions when available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 1920,
          height: 1080,
        },
      };

      const result = getAspectRatio(generation);
      expect(result).toBe('1920 / 1080');
    });

    it('should use asset dimensions even when batch config exists', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 800,
          height: 600,
        },
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        width: 1024,
        height: 1024,
        config: {
          prompt: 'test',
          width: 512,
          height: 512,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('800 / 600');
    });

    it('should not use asset dimensions when width or height is missing', () => {
      const generationWithoutHeight: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 1920,
        },
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          width: 1024,
          height: 768,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generationWithoutHeight, generationBatch);
      expect(result).toBe('1024 / 768');
    });
  });

  describe('Priority 2: generationBatch config width and height', () => {
    it('should use config dimensions when asset is not available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          width: 1024,
          height: 768,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1024 / 768');
    });

    it('should not use config dimensions when width or height is missing', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        width: 800,
        height: 600,
        config: {
          prompt: 'test',
          width: 1024,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('800 / 600');
    });
  });

  describe('Priority 3: generationBatch top-level width and height', () => {
    it('should use batch top-level dimensions when config is not available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        width: 1280,
        height: 720,
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1280 / 720');
    });

    it('should not use batch dimensions when width or height is missing', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        width: 1280,
        config: {
          prompt: 'test',
          size: '1024x768',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1024 / 768');
    });
  });

  describe('Priority 4: config size parameter', () => {
    it('should parse size parameter in format "1024x768"', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: '1920x1080',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1920 / 1080');
    });

    it('should ignore size parameter when it is "auto"', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: 'auto',
          aspectRatio: '16:9',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('16 / 9');
    });

    it('should not use invalid size format', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: 'invalid-format',
          aspectRatio: '4:3',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('4 / 3');
    });

    it('should handle various valid size formats', () => {
      const testCases = [
        { size: '512x512', expected: '512 / 512' },
        { size: '1024x768', expected: '1024 / 768' },
        { size: '1920x1080', expected: '1920 / 1080' },
        { size: '4096x4096', expected: '4096 / 4096' },
      ];

      testCases.forEach(({ size, expected }) => {
        const generation: Generation = {
          ...baseGeneration,
          asset: null,
        };

        const generationBatch: GenerationBatch = {
          id: 'batch-id',
          provider: 'test',
          model: 'test-model',
          prompt: 'test prompt',
          config: {
            prompt: 'test',
            size,
          },
          createdAt: new Date(),
          generations: [],
        };

        const result = getAspectRatio(generation, generationBatch);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Priority 5: config aspectRatio parameter', () => {
    it('should parse aspectRatio parameter in format "16:9"', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          aspectRatio: '16:9',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('16 / 9');
    });

    it('should not use invalid aspectRatio format', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          aspectRatio: 'invalid-format',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1 / 1');
    });

    it('should handle various valid aspectRatio formats', () => {
      const testCases = [
        { aspectRatio: '1:1', expected: '1 / 1' },
        { aspectRatio: '4:3', expected: '4 / 3' },
        { aspectRatio: '16:9', expected: '16 / 9' },
        { aspectRatio: '21:9', expected: '21 / 9' },
        { aspectRatio: '3:2', expected: '3 / 2' },
      ];

      testCases.forEach(({ aspectRatio, expected }) => {
        const generation: Generation = {
          ...baseGeneration,
          asset: null,
        };

        const generationBatch: GenerationBatch = {
          id: 'batch-id',
          provider: 'test',
          model: 'test-model',
          prompt: 'test prompt',
          config: {
            prompt: 'test',
            aspectRatio,
          },
          createdAt: new Date(),
          generations: [],
        };

        const result = getAspectRatio(generation, generationBatch);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Priority 6: default fallback', () => {
    it('should return "1 / 1" when no dimensions are available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const result = getAspectRatio(generation);
      expect(result).toBe('1 / 1');
    });

    it('should return "1 / 1" when generationBatch is undefined', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch = undefined;

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1 / 1');
    });

    it('should return "1 / 1" when all dimension sources are invalid', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: undefined,
        },
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: 'invalid',
          aspectRatio: 'invalid',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1 / 1');
    });
  });

  describe('Edge cases', () => {
    it('should handle zero dimensions in asset', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 0,
          height: 0,
        },
      };

      const result = getAspectRatio(generation);
      expect(result).toBe('1 / 1');
    });

    it('should handle zero dimensions in config', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          width: 0,
          height: 0,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1 / 1');
    });

    it('should handle null config', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: undefined,
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1 / 1');
    });

    it('should handle empty string in size and aspectRatio', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: '',
          aspectRatio: '',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getAspectRatio(generation, generationBatch);
      expect(result).toBe('1 / 1');
    });
  });
});

describe('getThumbnailMaxWidth', () => {
  // Mock base generation object
  const baseGeneration: Generation = {
    id: 'test-gen-id',
    seed: 12345,
    createdAt: new Date(),
    asyncTaskId: null,
    task: {
      id: 'task-id',
      status: 'success' as any,
    },
  };

  // Mock window.innerHeight for tests
  const originalWindow = global.window;

  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      writable: true,
      value: {
        innerHeight: 800,
      },
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  describe('when dimensions are available from asset', () => {
    it('should calculate thumbnail width for landscape image within 512px', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 400,
          height: 300,
        },
      };

      const result = getThumbnailMaxWidth(generation);
      expect(result).toBe(400); // No scaling needed
    });

    it('should calculate thumbnail width for large landscape image', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 1024,
          height: 768,
        },
      };

      const result = getThumbnailMaxWidth(generation);
      expect(result).toBe(512); // Scale to max width 512
    });

    it('should calculate thumbnail width for portrait image', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 768,
          height: 1024,
        },
      };

      const result = getThumbnailMaxWidth(generation);
      // (768 * 512) / 1024 = 384, but screen height constraint (800/2=400) limits it
      // Scale: 400/512 = 0.78125, final width: 384 * 0.78125 = 300
      expect(result).toBe(300);
    });

    it('should limit height by screen height constraint', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 512,
          height: 1000, // This would exceed screen height / 2 (400px)
        },
      };

      const result = getThumbnailMaxWidth(generation);
      // Original thumbnail would be 512 width, 1000 height
      // Screen constraint: height must be <= 400
      // Scale: 400/1000 = 0.4
      // Final width: 512 * 0.4 = 204.8 → 205
      expect(result).toBe(205);
    });
  });

  describe('when dimensions are available from generationBatch config', () => {
    it('should use config dimensions when asset is not available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          width: 1024,
          height: 512,
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getThumbnailMaxWidth(generation, generationBatch);
      expect(result).toBe(512); // 1024 > 512, so scale to 512 width
    });
  });

  describe('when dimensions are available from generationBatch top-level', () => {
    it('should use batch dimensions when config is not available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        width: 800,
        height: 600,
        createdAt: new Date(),
        generations: [],
      };

      const result = getThumbnailMaxWidth(generation, generationBatch);
      expect(result).toBe(512); // 800 > 600, so scale to 512 width
    });
  });

  describe('when dimensions are available from size parameter', () => {
    it('should parse size parameter correctly', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: '1920x1080',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getThumbnailMaxWidth(generation, generationBatch);
      expect(result).toBe(512); // 1920 > 1080, so scale to 512 width
    });
  });

  describe('when only aspectRatio is available (no dimensions)', () => {
    it('should return DEFAULT_MAX_ITEM_WIDTH for aspectRatio without dimensions', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          aspectRatio: '16:9',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getThumbnailMaxWidth(generation, generationBatch);
      // When only aspectRatio is available (no concrete dimensions), return default width
      expect(result).toBe(DEFAULT_MAX_ITEM_WIDTH);
    });

    it('should also return DEFAULT_MAX_ITEM_WIDTH for portrait aspectRatio', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          aspectRatio: '9:16',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getThumbnailMaxWidth(generation, generationBatch);
      // When only aspectRatio is available (no concrete dimensions), return default width
      expect(result).toBe(DEFAULT_MAX_ITEM_WIDTH);
    });
  });

  describe('fallback behavior', () => {
    it('should return DEFAULT_MAX_ITEM_WIDTH when no dimensions are available', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const result = getThumbnailMaxWidth(generation);
      expect(result).toBe(DEFAULT_MAX_ITEM_WIDTH);
    });

    it('should return DEFAULT_MAX_ITEM_WIDTH when generationBatch has no valid dimensions', () => {
      const generation: Generation = {
        ...baseGeneration,
        asset: null,
      };

      const generationBatch: GenerationBatch = {
        id: 'batch-id',
        provider: 'test',
        model: 'test-model',
        prompt: 'test prompt',
        config: {
          prompt: 'test',
          size: 'invalid',
          aspectRatio: 'invalid',
        },
        createdAt: new Date(),
        generations: [],
      };

      const result = getThumbnailMaxWidth(generation, generationBatch);
      expect(result).toBe(DEFAULT_MAX_ITEM_WIDTH);
    });
  });

  describe('screen height constraint', () => {
    it('should limit width when calculated height exceeds screen height / 2', () => {
      Object.defineProperty(global, 'window', {
        writable: true,
        value: {
          innerHeight: 600,
        },
      });

      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 400,
          height: 800, // Height exceeds 600/2 = 300
        },
      };

      const result = getThumbnailMaxWidth(generation, undefined);
      // Original: 400x800, within 512 limit so no initial scaling
      // Screen constraint: height must be <= 300
      // Scale: 300/800 = 0.375
      // Final width: 400 * 0.375 = 150
      expect(result).toBe(150);
    });

    it('should handle server-side rendering (no window)', () => {
      delete (global as any).window;

      const generation: Generation = {
        ...baseGeneration,
        asset: {
          type: 'image',
          width: 600,
          height: 1000,
        },
      };

      const result = getThumbnailMaxWidth(generation);
      // Original: 600x1000, calculateThumbnailDimensions gives us:
      // thumbnailWidth = Math.round((600 * 512) / 1000) = 307
      // In SSR environment, no height constraint applied, return thumbnailWidth directly
      expect(result).toBe(307);
    });
  });
});
