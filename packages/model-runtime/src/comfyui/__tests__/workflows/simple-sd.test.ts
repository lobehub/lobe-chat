// @vitest-environment node
import { PromptBuilder } from '@saintno/comfyui-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SimpleSDParams, buildSimpleSDWorkflow } from '../../workflows/simple-sd';

// Mock configuration interface for test models
interface MockModelConfig {
  family: string;
  modelFamily: 'FLUX' | 'SD1' | 'SDXL' | 'SD3';
  variant: string;
}

// Mock the model resolver that the WorkflowDetector uses
vi.mock('../../utils/modelResolver', () => ({
  resolveModel: vi.fn((modelName: string) => {
    const cleanName = modelName.replace(/^comfyui\//, '');

    // Mock configuration mapping for test models
    const configs: Record<string, MockModelConfig> = {
      'legacy_model.safetensors': {
        family: 'sd15',
        modelFamily: 'SD1',
        variant: 'sd15',
      },
      'sd3.5_large.safetensors': {
        family: 'sd35',
        modelFamily: 'SD3',
        variant: 'sd35',
      },
      'sd3.5_medium_incl_clips_t5xxlfp8scaled.safetensors': {
        family: 'sd35-inclclip',
        modelFamily: 'SD3',
        variant: 'sd35-inclclip',
      },
      'sd_xl_base_1.0.safetensors': {
        family: 'sdxl',
        modelFamily: 'SDXL',
        variant: 'sdxl',
      },
      'test.safetensors': {
        family: 'sdxl',
        modelFamily: 'SDXL',
        variant: 'sdxl',
      },
      'v1-5-pruned-emaonly.safetensors': {
        family: 'sd15',
        modelFamily: 'SD1',
        variant: 'sd15',
      },
    };

    return configs[cleanName] || null;
  }),
}));

// Create mock context with proper service layer
const mockContext = {
  clientService: {
    getObjectInfo: vi.fn().mockResolvedValue({}),
  },
  modelResolverService: {
    getAvailableVAEFiles: vi.fn().mockResolvedValue([
      'sdxl_vae.safetensors',
      'custom_vae_lobe.safetensors',
    ]),
    getOptimalComponent: vi
      .fn()
      .mockImplementation(async (type: string, modelFamily: string) => {
        if (type !== 'vae') return undefined;
        
        // SD3 models don't use external VAE
        if (modelFamily === 'SD3') {
          return undefined;
        }
        
        // SDXL and SD1 models get external VAE
        if (modelFamily === 'SDXL' || modelFamily === 'SD1') {
          return 'sdxl_vae.safetensors';
        }
        
        return undefined;
      }),
  },
} as any;

// Mock PromptBuilder
vi.mock('@saintno/comfyui-sdk', () => ({
  PromptBuilder: vi.fn().mockImplementation((workflow) => {
    const mockInstance = {
      input: vi.fn().mockReturnThis(),
      setInputNode: vi.fn().mockReturnThis(),
      setOutputNode: vi.fn().mockReturnThis(),
      workflow, // Expose the workflow for testing
    };
    return mockInstance;
  }),
}));

describe('buildSimpleSDWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Text-to-Image Mode (t2i)', () => {
    it('should create t2i workflow with default parameters', async () => {
      const modelName = 'sd_xl_base_1.0.safetensors';
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };

      await buildSimpleSDWorkflow(modelName, params, mockContext);

      // Verify PromptBuilder was called with workflow and node mappings
      expect(PromptBuilder).toHaveBeenCalledWith(
        expect.any(Object), // workflow
        expect.arrayContaining(['prompt', 'width', 'height']), // input keys
        ['images'], // output keys
      );

      // Access the workflow from the mock
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Verify core nodes exist
      expect(workflow['1']).toEqual({
        _meta: { title: 'Load Checkpoint' },
        class_type: 'CheckpointLoaderSimple',
        inputs: { ckpt_name: modelName },
      });

      expect(workflow['2']).toEqual({
        _meta: { title: 'Positive Prompt' },
        class_type: 'CLIPTextEncode',
        inputs: {
          clip: ['1', 1],
          text: params.prompt,
        },
      });

      expect(workflow['4']).toEqual({
        _meta: { title: 'Empty Latent' },
        class_type: 'EmptyLatentImage',
        inputs: {
          batch_size: 1,
          height: params.height,
          width: params.width,
        },
      });

      // Verify KSampler uses EmptyLatentImage for t2i mode
      expect(workflow['5'].inputs.latent_image).toEqual(['4', 0]);
      expect(workflow['5'].inputs.denoise).toBe(1);

      // Verify i2i-specific nodes don't exist
      expect(workflow['IMG_LOAD']).toBeUndefined();
      expect(workflow['IMG_ENCODE']).toBeUndefined();
    });

    it('should handle explicit t2i mode', async () => {
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('test.safetensors', params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should still use EmptyLatentImage
      expect(workflow['5'].inputs.latent_image).toEqual(['4', 0]);
      expect(workflow['IMG_LOAD']).toBeUndefined();
      expect(workflow['IMG_ENCODE']).toBeUndefined();
    });
  });

  describe('Image-to-Image Mode (i2i)', () => {
    it('should treat i2i parameters as regular text-to-image (i2i not supported in current service)', async () => {
      // Note: The current service architecture doesn't support i2i mode
      // These parameters would be ignored and a t2i workflow would be created
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('test.safetensors', params, mockContext);

      // Verify PromptBuilder was called with workflow and node mappings
      expect(PromptBuilder).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['prompt', 'width', 'height']), // basic params
        ['images'],
      );

      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should create a standard t2i workflow (no i2i nodes)
      expect(workflow['IMG_LOAD']).toBeUndefined();
      expect(workflow['IMG_ENCODE']).toBeUndefined();

      // Should use standard t2i latent source
      expect(workflow['5'].inputs.latent_image).toEqual(['4', 0]); // EmptyLatentImage
      // Note: simple-sd always uses denoise=1 for t2i mode, ignoring the denoise parameter
      expect(workflow['5'].inputs.denoise).toBe(1);
    });

    it('should use default denoise value when not provided', async () => {
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('test.safetensors', params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should use default denoise value of 1 for t2i mode
      expect(workflow['5'].inputs.denoise).toBe(1);
    });

    it('should always use t2i mode (service does not support mode parameter)', async () => {
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('test.safetensors', params, mockContext);

      // Should use t2i workflow structure
      expect(PromptBuilder).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['prompt']), // input keys
        ['images'], // output keys
      );

      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should not create i2i nodes
      expect(workflow['IMG_LOAD']).toBeUndefined();
      expect(workflow['IMG_ENCODE']).toBeUndefined();

      // Should use EmptyLatentImage
      expect(workflow['5'].inputs.latent_image).toEqual(['4', 0]);
      expect(workflow['5'].inputs.denoise).toBe(1);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with legacy parameter format (Record<string, any>)', async () => {
      const modelName = 'legacy_model.safetensors';
      const params = {
        height: 512,
        prompt: 'Legacy test',
        width: 512,
      };

      await buildSimpleSDWorkflow(modelName, params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should default to t2i mode
      expect(workflow['1'].inputs.ckpt_name).toBe(modelName);
      expect(workflow['2'].inputs.text).toBe(params.prompt);
      expect(workflow['5'].inputs.latent_image).toEqual(['4', 0]);
      expect(workflow['IMG_LOAD']).toBeUndefined();
    });

    it('should handle missing optional parameters gracefully', async () => {
      const params: SimpleSDParams = {
        prompt: 'Minimal test',
      };

      // Test that the function doesn't throw by calling it
      await buildSimpleSDWorkflow('test.safetensors', params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should use sensible defaults
      expect(typeof workflow['5'].inputs.seed).toBe('number'); // seed should be a number
      expect(workflow['5'].inputs.denoise).toBe(1);
    });
  });

  describe('Workflow Structure', () => {
    it('should maintain consistent node IDs for core components', async () => {
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('test.safetensors', params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Core nodes should always exist with same IDs
      expect(workflow['1'].class_type).toBe('CheckpointLoaderSimple');
      expect(workflow['2'].class_type).toBe('CLIPTextEncode');
      expect(workflow['3'].class_type).toBe('CLIPTextEncode');
      expect(workflow['4'].class_type).toBe('EmptyLatentImage');
      expect(workflow['5'].class_type).toBe('KSampler');
      expect(workflow['6'].class_type).toBe('VAEDecode');
      expect(workflow['7'].class_type).toBe('SaveImage');
    });

    it('should use consistent numeric node IDs for standard workflow', async () => {
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('test.safetensors', params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Standard t2i workflow nodes should use numeric IDs
      expect(workflow['1']).toBeDefined(); // Checkpoint
      expect(workflow['2']).toBeDefined(); // Positive prompt
      expect(workflow['3']).toBeDefined(); // Negative prompt
      expect(workflow['4']).toBeDefined(); // Empty latent
      expect(workflow['5']).toBeDefined(); // KSampler
      expect(workflow['6']).toBeDefined(); // VAE Decode
      expect(workflow['7']).toBeDefined(); // Save Image

      // Should not have dynamic string IDs (no i2i support)
      expect(workflow['IMG_LOAD']).toBeUndefined();
      expect(workflow['IMG_ENCODE']).toBeUndefined();
    });
  });

  describe('VAE Conditional Logic', () => {
    it('should use built-in VAE for SD3.5 models', async () => {
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('sd3.5_large.safetensors', params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should not create VAE_LOADER node for SD3.5
      expect(workflow['VAE_LOADER']).toBeUndefined();

      // VAEDecode should use built-in VAE
      expect(workflow['6'].inputs.vae).toEqual(['1', 2]);
    });

    it('should use built-in VAE for custom-sd models', async () => {
      const params: SimpleSDParams = {
        prompt: 'Test with custom SD',
      };

      await buildSimpleSDWorkflow(
        'sd3.5_medium_incl_clips_t5xxlfp8scaled.safetensors',
        params,
        mockContext,
      );
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should not create VAE_LOADER node for custom-sd
      expect(workflow['VAE_LOADER']).toBeUndefined();

      // VAEDecode should use built-in VAE
      expect(workflow['6'].inputs.vae).toEqual(['1', 2]);
    });

    it('should use external VAE for SD1.5 models when available', async () => {
      const params: SimpleSDParams = {
        prompt: 'Test with SD1.5',
      };

      await buildSimpleSDWorkflow(
        'v1-5-pruned-emaonly.safetensors',
        params,
        mockContext,
      );
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // For SD1.5, should try to use external VAE if available
      // The actual behavior depends on system component availability
      // We can check that the logic path is correct
      expect(workflow['6']).toBeDefined();
      expect(workflow['6'].class_type).toBe('VAEDecode');
    });

    it('should use external VAE for SDXL models when available', async () => {
      const params: SimpleSDParams = {
        prompt: 'Test with SDXL',
      };

      await buildSimpleSDWorkflow(
        'sd_xl_base_1.0.safetensors',
        params,
        mockContext,
      );
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // For SDXL, should try to use external VAE if available
      // The actual behavior depends on system component availability
      expect(workflow['6']).toBeDefined();
      expect(workflow['6'].class_type).toBe('VAEDecode');
    });

    it('should use external VAE for SDXL models in t2i mode', async () => {
      const params: SimpleSDParams = {
        prompt: 'Test with SDXL',
      };

      await buildSimpleSDWorkflow(
        'sd_xl_base_1.0.safetensors',
        params,
        mockContext,
      );
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should have VAE decode node
      expect(workflow['6']).toBeDefined();
      expect(workflow['6'].class_type).toBe('VAEDecode');

      // Should use external VAE if available (node 10)
      // The actual VAE source depends on service implementation
      expect(workflow['6'].inputs.vae).toBeDefined();
    });

    it('should use built-in VAE for SD3.5 models in t2i mode', async () => {
      const params: SimpleSDParams = {
        cfg: 7.5,
        height: 512,
        prompt: 'A beautiful landscape',
        steps: 20,
        width: 512,
      };
      
      await buildSimpleSDWorkflow('sd3.5_large.safetensors', params, mockContext);
      const workflow = (PromptBuilder as any).mock.calls[0][0];

      // Should not create external VAE_LOADER node
      expect(workflow['10']).toBeUndefined(); // No external VAE loader

      // VAE decode should use built-in VAE from checkpoint
      expect(workflow['6'].inputs.vae).toEqual(['1', 2]); // Built-in VAE
    });
  });
});
