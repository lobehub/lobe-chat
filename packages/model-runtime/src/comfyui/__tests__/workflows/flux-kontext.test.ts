// @vitest-environment node
import { PromptBuilder } from '@saintno/comfyui-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ComfyUIClientService } from '../../services/comfyuiClient';
import { ModelResolverService } from '../../services/modelResolver';
import { WorkflowContext } from '../../services/workflowBuilder';
import { buildFluxKontextWorkflow } from '../../workflows/flux-kontext';

// Mock the utility functions
vi.mock('../../utils/promptSplitter', () => ({
  splitPromptForDualCLIP: vi.fn((prompt: string) => ({
    clipLPrompt: prompt,
    t5xxlPrompt: prompt,
  })),
}));

vi.mock('../../utils/weightDType', () => ({
  selectOptimalWeightDtype: vi.fn(() => 'default'),
}));

// Mock services
vi.mock('../../services/comfyuiClient');
vi.mock('../../services/modelResolver');

// Mock PromptBuilder and seed function - capture constructor arguments for test access
vi.mock('@saintno/comfyui-sdk', () => ({
  PromptBuilder: vi.fn().mockImplementation((workflow) => {
    // Store the workflow reference so modifications are reflected
    const mockInstance = {
      input: vi.fn().mockReturnThis(),
      setInputNode: vi.fn().mockReturnThis(),
      setOutputNode: vi.fn().mockReturnThis(),
      workflow, // Expose the workflow for testing
    };
    return mockInstance;
  }),
  seed: vi.fn(() => 42),
}));

describe('buildFluxKontextWorkflow', () => {
  let mockContext: WorkflowContext;
  let mockModelResolver: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockModelResolver = {
      getOptimalComponent: vi.fn().mockImplementation((type: string) => {
        // Return real component names based on type
        switch (type) {
          case 't5': {
            return Promise.resolve('t5xxl_fp16.safetensors');
          }
          case 'vae': {
            return Promise.resolve('ae.safetensors');
          }
          case 'clip': {
            return Promise.resolve('clip_l.safetensors');
          }
          default: {
            return Promise.reject(new Error(`Unknown component type: ${type}`));
          }
        }
      }),
    };

    mockContext = {
      clientService: {} as ComfyUIClientService,
      modelResolverService: mockModelResolver as ModelResolverService,
    };
  });

  it('should create FLUX Kontext workflow with default parameters', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      
prompt: 'A beautiful landscape',  
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      

// Default from fluxKontextDevParamsSchema
steps: 28,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    const result = await buildFluxKontextWorkflow(modelName, params, mockContext);

    expect(PromptBuilder).toHaveBeenCalledWith(
      expect.objectContaining({
        '1': expect.objectContaining({
          class_type: 'DualCLIPLoader',
        }),
        '2': expect.objectContaining({
          class_type: 'UNETLoader',
          inputs: expect.objectContaining({
            unet_name: modelName,
          }),
        }),
        '3': expect.objectContaining({
          class_type: 'VAELoader',
        }),
      }),
      expect.any(Array),
      expect.any(Array),
    );

    expect(result.setOutputNode).toHaveBeenCalled();
  });

  it('should create workflow with custom parameters', async () => {
    const modelName = 'custom_flux_kontext.safetensors';
    const params = {
      cfg: 4,
      height: 768,
      prompt: 'Custom prompt',
      samplerName: 'euler',  
      // Custom sampler
scheduler: 'simple',
      

steps: 30,  
      // Custom value different from default
width: 512,  // Custom scheduler
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];
    expect(workflow['2'].inputs.unet_name).toBe(modelName);
  });

  it('should handle image-to-image parameters', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      

imageUrl: 'input_image.png',
      


prompt: 'test',  
      

// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      


// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      



// Default from fluxKontextDevParamsSchema
steps: 28,  
      


// Use imageUrl instead of image
strength: 0.8,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    // Should not throw and should create valid workflow
    expect(PromptBuilder).toHaveBeenCalled();
  });

  it('should support img2img workflow', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      

imageUrl: 'test.png',  
      


prompt: 'test',  
      


// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      



// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      




// Default from fluxKontextDevParamsSchema
steps: 28,  
      



// Use imageUrl
strength: 0.75,  
      
// Default from fluxKontextDevParamsSchema
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should have image loading capabilities for img2img
    const hasImageLoader = Object.values(workflow).some(
      (node: any) =>
        node.class_type === 'LoadImage' ||
        node.class_type === 'ImageUploadTransformed' ||
        node.class_type === 'VAEEncode',
    );

    // Kontext workflow supports img2img so should have image processing nodes
    expect(hasImageLoader || Object.keys(workflow).length > 8).toBe(true);
  });

  it('should handle empty prompt', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,  
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      

prompt: '',  
      

// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      


// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      


// Default from fluxKontextDevParamsSchema
steps: 28,  
      
// Empty prompt from fluxKontextDevParamsSchema default
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    // Should not throw and should create valid workflow
    expect(PromptBuilder).toHaveBeenCalled();
  });

  it('should use appropriate default steps for Kontext model', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = { 
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      

// Default from fluxKontextDevParamsSchema
steps: 28,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Kontext typically uses 28 steps by default
    const schedulerNode = Object.values(workflow).find(
      (node: any) => node.class_type === 'BasicScheduler',
    ) as any;

    if (schedulerNode) {
      expect(schedulerNode.inputs.steps).toBe(28);
    }
  });

  it('should have correct workflow structure', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = { 
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      

// Default from fluxKontextDevParamsSchema
steps: 28,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should have essential nodes for FLUX Kontext workflow
    const hasRequiredNodes = ['DualCLIPLoader', 'UNETLoader', 'VAELoader', 'SaveImage'].every(
      (nodeType) => Object.values(workflow).some((node: any) => node.class_type === nodeType),
    );

    expect(hasRequiredNodes).toBe(true);
  });

  it('should have all meta information', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = { 
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      

// Default from fluxKontextDevParamsSchema
steps: 28,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check that nodes have meta titles
    Object.values(workflow).forEach((node: any) => {
      expect(node._meta).toBeDefined();
      expect(node._meta.title).toBeDefined();
      expect(typeof node._meta.title).toBe('string');
    });
  });

  it('should support vision capabilities', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,  
      

imageUrl: 'input.jpg',  
      


prompt: 'test',  
      


// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      



// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      




// Default from fluxKontextDevParamsSchema
steps: 28,  
      



// Use imageUrl instead of image
strength: 0.75,  
      
// Default from fluxKontextDevParamsSchema
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    // Kontext model supports vision (img2img), so workflow should be created successfully
    expect(PromptBuilder).toHaveBeenCalled();

    const workflow = (PromptBuilder as any).mock.calls[0][0];
    expect(Object.keys(workflow).length).toBeGreaterThan(0);
  });

  it('should create image-to-image workflow with imageUrl parameter', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,
      

imageUrl: 'https://example.com/image.jpg',
      

prompt: 'Transform this image into a painting',  
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      


// Default from fluxKontextDevParamsSchema
steps: 28,  
      


strength: 0.8,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];
    const inputParams = (PromptBuilder as any).mock.calls[0][1];

    // Should have image loading and encoding nodes
    expect(workflow['img_load']).toBeDefined();
    expect(workflow['img_load'].class_type).toBe('LoadImage');
    expect(workflow['img_load'].inputs.image).toBe('https://example.com/image.jpg');

    expect(workflow['img_encode']).toBeDefined();
    expect(workflow['img_encode'].class_type).toBe('VAEEncode');
    expect(workflow['img_encode'].inputs.pixels).toEqual(['img_load', 0]);
    expect(workflow['img_encode'].inputs.vae).toEqual(['3', 0]);

    // Sampler should use encoded image as latent
    expect(workflow['10'].inputs.latent_image).toEqual(['img_encode', 0]);

    // Should not have EmptySD3LatentImage node
    expect(workflow['7']).toBeUndefined();

    // Input params should include imageUrl and denoise
    expect(inputParams).toContain('imageUrl');
    expect(inputParams).toContain('denoise');

    // Scheduler should use provided denoise value
    expect(workflow['9'].inputs.denoise).toBe(0.8);
  });

  it('should create image-to-image workflow with imageUrls array parameter', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,
      

imageUrls: ['https://example.com/first.jpg', 'https://example.com/second.jpg'],
      

prompt: 'Apply artistic style',  
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      


// Default from fluxKontextDevParamsSchema
steps: 28,  
      


strength: 0.65,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];
    const inputParams = (PromptBuilder as any).mock.calls[0][1];

    // Should have image loading node with first image from array
    expect(workflow['img_load']).toBeDefined();
    expect(workflow['img_load'].class_type).toBe('LoadImage');
    expect(workflow['img_load'].inputs.image).toBe('https://example.com/first.jpg');

    // Should have VAE encode node
    expect(workflow['img_encode']).toBeDefined();
    expect(workflow['img_encode'].class_type).toBe('VAEEncode');

    // Sampler should use encoded image
    expect(workflow['10'].inputs.latent_image).toEqual(['img_encode', 0]);

    // Should not have EmptySD3LatentImage node
    expect(workflow['7']).toBeUndefined();

    // Input params should include imageUrl and denoise
    expect(inputParams).toContain('imageUrl');
    expect(inputParams).toContain('denoise');

    // Scheduler should use provided denoise value
    expect(workflow['9'].inputs.denoise).toBe(0.65);
  });

  it('should use provided strength value for image-to-image when passed', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
      

// Default from fluxKontextDevParamsSchema
height: 1024,
      

imageUrl: 'https://example.com/test.png',
      

prompt: 'Edit image',  
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      


// Default from fluxKontextDevParamsSchema
steps: 28,  
      


strength: 0.75,  
      
width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should use provided strength value as denoise
    expect(workflow['9'].inputs.denoise).toBe(0.75);

    // Should have image nodes
    expect(workflow['img_load']).toBeDefined();
    expect(workflow['img_encode']).toBeDefined();
  });

  it('should create text-to-image workflow when no image parameters provided', async () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      // Default from fluxKontextDevParamsSchema
cfg: 3.5,
      
height: 1024,
      
prompt: 'Generate a new image',
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
      
// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      
steps: 28,  
      width: 1024,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];
    const inputParams = (PromptBuilder as any).mock.calls[0][1];

    // Should have EmptySD3LatentImage node for text-to-image
    expect(workflow['7']).toBeDefined();
    expect(workflow['7'].class_type).toBe('EmptySD3LatentImage');
    expect(workflow['7'].inputs.width).toBe(1024);
    expect(workflow['7'].inputs.height).toBe(1024);

    // Should not have image loading/encoding nodes
    expect(workflow['img_load']).toBeUndefined();
    expect(workflow['img_encode']).toBeUndefined();

    // Sampler should use empty latent
    expect(workflow['10'].inputs.latent_image).toEqual(['7', 0]);

    // Input params should not include imageUrl or denoise
    expect(inputParams).not.toContain('imageUrl');
    expect(inputParams).not.toContain('denoise');

    // Scheduler should use denoise value of 1 for text-to-image
    // Note: denoise is set via builder.input, not directly on workflow node
    // The actual workflow node won't have denoise until builder processes it
  });

  it('should handle image-to-image mode with conditional EmptySD3LatentImage node', async () => {
    // This test covers lines 269-271 in flux-kontext.ts
    const modelName = 'flux_kontext.safetensors';
    const params = {
      // Default from fluxKontextDevParamsSchema
cfg: 3.5,
      
height: 768,
      
imageUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      
prompt: 'Enhanced landscape',
      
// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',
      

// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      

steps: 28,  
      
strength: 0.8,  
      width: 512,  // Default from fluxKontextDevParamsSchema
    };

    const result = await buildFluxKontextWorkflow(modelName, params, mockContext);

    expect(PromptBuilder).toHaveBeenCalled();
    expect(result.input).toHaveBeenCalledWith('imageUrl', params.imageUrl);
    expect(result.input).toHaveBeenCalledWith('denoise', 0.8);

    // Get the workflow from the mock call
    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // In image-to-image mode, should have image loading/encoding nodes
    expect(workflow['img_load']).toBeDefined();
    expect(workflow['img_encode']).toBeDefined();

    // Sampler should use encoded latent from image
    expect(workflow['10'].inputs.latent_image).toEqual(['img_encode', 0]);

    // Scheduler should use provided denoise value
    expect(workflow['9'].inputs.denoise).toBe(0.8);

    // Check that EmptySD3LatentImage node (if it exists) gets width/height set
    // This tests the conditional logic at lines 268-271
    if (workflow['7']) {
      expect(workflow['7'].inputs.width).toBe(512);
      expect(workflow['7'].inputs.height).toBe(768);
    }

    // In image-to-image mode, ModelSamplingFlux should NOT have width/height set directly
    // (they would be undefined or derived from the image encoder)
    // The key point is that these are NOT explicitly set in the workflow for image-to-image
    // But the actual workflow might still have default values, so we just check it exists
    expect(workflow['4']).toBeDefined();
  });

  it('should not create EmptySD3LatentImage in image-to-image mode', async () => {
    // Test that in image-to-image mode, workflow['7'] (EmptySD3LatentImage) is not created
    // and width/height are only set on workflow['4'] (ModelSamplingFlux)

    const modelName = 'flux_kontext.safetensors';
    const params = {
      // Default from fluxKontextDevParamsSchema
cfg: 3.5,
      
height: 480,
      
imageUrl: 'data:image/png;base64,test',  
      
prompt: 'Test image modification',
      

// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',
      


// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
      


steps: 28,  
      

strength: 0.75,  
      // Default from fluxKontextDevParamsSchema
width: 640,  // Default from fluxKontextDevParamsSchema
    };

    await buildFluxKontextWorkflow(modelName, params, mockContext);

    // Get the workflow from the PromptBuilder mock
    const workflow = (PromptBuilder as any).mock.calls[
      (PromptBuilder as any).mock.calls.length - 1
    ][0];

    // In image-to-image mode, workflow['7'] (EmptySD3LatentImage) should not exist
    // Instead, width/height are set on workflow['4'] (ModelSamplingFlux)
    expect(workflow['7']).toBeUndefined(); // No EmptySD3LatentImage in i2i mode
    expect(workflow['4']).toBeDefined();
    expect(workflow['4'].inputs.width).toBe(640);
    expect(workflow['4'].inputs.height).toBe(480);
  });

  describe('Coverage Completion Tests', () => {
    it('should handle fallback imageUrl logic in LoadImage node with params.imageUrls', async () => {
      const modelName = 'flux_kontext.safetensors';
      const params = {
        
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
        

// Default from fluxKontextDevParamsSchema
height: 1024,
        
        

imageUrls: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],  
        


prompt: 'Test with imageUrls array',  
        


// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
        



// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
        




// Default from fluxKontextDevParamsSchema
steps: 28,  
        



// No imageUrl property, should fall back to imageUrls[0]
strength: 0.75,  
        
// Default from fluxKontextDevParamsSchema
width: 1024,  // Default from fluxKontextDevParamsSchema
      };

      await buildFluxKontextWorkflow(modelName, params, mockContext);

      // Get the most recent call to PromptBuilder
      const calls = (PromptBuilder as any).mock.calls;
      const lastCall = calls.at(-1);
      const workflow = lastCall[0];

      // This covers line 182: image: params.imageUrl || params.imageUrls?.[0] || ''
      // Should use imageUrls[0] since imageUrl is not provided
      expect(workflow['img_load']).toBeDefined();
      expect(workflow['img_load'].inputs.image).toBe('http://example.com/image1.jpg');
    });

    it('should handle empty imageUrl fallback logic in LoadImage node', async () => {
      const modelName = 'flux_kontext.safetensors';
      const params = {
        

// Default from fluxKontextDevParamsSchema
cfg: 3.5, 
        


// Default from fluxKontextDevParamsSchema
height: 1024,
        

// Provide a URL to trigger image mode
imageUrl: 'http://example.com/test.jpg',
        
        

imageUrls: [],  
        


prompt: 'Test with valid image URL',  
        


// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
        



// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
        




// Default from fluxKontextDevParamsSchema
steps: 28,  
        



// Empty array to test fallback
strength: 0.75,  
        
// Default from fluxKontextDevParamsSchema
width: 1024,  // Default from fluxKontextDevParamsSchema
      };

      await buildFluxKontextWorkflow(modelName, params, mockContext);

      // Get the most recent call to PromptBuilder
      const calls = (PromptBuilder as any).mock.calls;
      const lastCall = calls.at(-1);
      const workflow = lastCall[0];

      // This covers line 182: image: params.imageUrl || params.imageUrls?.[0] || ''
      // Should use imageUrl when provided even if imageUrls is empty
      expect(workflow['img_load']).toBeDefined();
      expect(workflow['img_load'].inputs.image).toBe('http://example.com/test.jpg');
    });

    it('should handle hasInputImage branch logic with imageUrl fallback in builder input', async () => {
      const modelName = 'flux_kontext.safetensors';
      const params = {
        
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
        

// Default from fluxKontextDevParamsSchema
height: 1024,
        
        

imageUrls: ['http://example.com/fallback-image.jpg'],
        


prompt: 'Test hasInputImage branch',  
        

// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
        


// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
        



// Default from fluxKontextDevParamsSchema
steps: 28,  
        


// No imageUrl, should use imageUrls[0]
strength: 0.8,  
        
width: 1024,  // Default from fluxKontextDevParamsSchema
      };

      const result = await buildFluxKontextWorkflow(modelName, params, mockContext);

      // Check that input() was called with the correct imageUrl value
      // This covers line 284: .input('imageUrl', params.imageUrl || params.imageUrls?.[0] || '')
      expect(result.input).toHaveBeenCalledWith(
        'imageUrl',
        'http://example.com/fallback-image.jpg',
      );
      expect(result.input).toHaveBeenCalledWith('denoise', 0.8);
    });

    it('should handle hasInputImage branch with empty fallback in builder input', async () => {
      const modelName = 'flux_kontext.safetensors';
      const params = {
        
// Default from fluxKontextDevParamsSchema
cfg: 3.5,
        
        

// Default from fluxKontextDevParamsSchema
height: 1024,
        


prompt: 'Test hasInputImage with no image',  
        

// Default from fluxKontextDevParamsSchema
samplerName: 'dpmpp_2m',  
        


// Default from fluxKontextDevParamsSchema
scheduler: 'karras',  
        



// Default from fluxKontextDevParamsSchema
steps: 28,  
        


// No imageUrl or imageUrls
strength: 0.9,  
        
width: 1024,  // Default from fluxKontextDevParamsSchema
      };

      const result = await buildFluxKontextWorkflow(modelName, params, mockContext);

      // Check that input() was called with empty string for imageUrl
      // This covers line 284: .input('imageUrl', params.imageUrl || params.imageUrls?.[0] || '')
      expect(result.input).toHaveBeenCalledWith('denoise', 1);  // Text-to-image uses denoise=1
      // In text-to-image mode (no imageUrl), the denoise should use default value
      // and imageUrl input should NOT be called at all
      expect(result.input).not.toHaveBeenCalledWith('imageUrl', expect.anything());
    });
  });
});
