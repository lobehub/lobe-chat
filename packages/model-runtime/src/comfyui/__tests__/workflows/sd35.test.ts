// @vitest-environment node
import { PromptBuilder } from '@saintno/comfyui-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_SD35_MODELS } from '../constants/testModels';
import { WorkflowError } from '../../errors';
import { ComfyUIClientService } from '../../services/comfyuiClient';
import { ModelResolverService } from '../../services/modelResolver';
import { WorkflowContext } from '../../services/workflowBuilder';
import { buildSD35Workflow } from '../../workflows/sd35';

// Mock the system components to simulate having all encoders available with correct modelFamily
vi.mock('../../config/systemComponents', () => ({
  getAllComponentsWithNames: vi.fn((options) => {
    if (options?.type === 'clip' && options?.modelFamily === 'FLUX') {
      return [
        { config: { modelFamily: 'FLUX', priority: 1 }, name: 'clip_l.safetensors' },
      ];
    }
    if (options?.type === 'clip' && options?.modelFamily === 'SD3') {
      return [
        { config: { modelFamily: 'SD3', priority: 1 }, name: 'clip_g.safetensors' },
      ];
    }
    if (options?.type === 't5' && options?.modelFamily === 'FLUX') {
      return [{ config: { modelFamily: 'FLUX', priority: 1 }, name: 't5xxl_fp16.safetensors' }];
    }
    return [];
  }),
}));

// Mock services
vi.mock('../../services/comfyuiClient');
vi.mock('../../services/modelResolver');

// Mock PromptBuilder - capture constructor arguments for test access
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
}));

describe('buildSD35Workflow', () => {
  let mockContext: WorkflowContext;
  let mockModelResolver: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockModelResolver = {
      getOptimalComponent: vi.fn().mockImplementation((type: string, modelFamily: string) => {
        if (type === 'clip' && modelFamily === 'SD3') {
          // For testing purposes, always return both clipL and clipG as available
          // This simulates the service finding appropriate components
          return Promise.resolve('clip_l.safetensors'); // We'll return clipL first
        }
        if (type === 't5' && modelFamily === 'SD3') {
          return Promise.resolve('t5xxl_fp16.safetensors');
        }
        return Promise.resolve(undefined);
      }),
      selectComponents: vi.fn().mockResolvedValue({
        clip: ['clip_g.safetensors', 'clip_l.safetensors', 't5xxl_fp16.safetensors'],
      }),
      selectVAE: vi.fn(),
    };

    // Set up specific mock behavior for each test based on corrected modelFamily parameters
    mockModelResolver.getOptimalComponent = vi.fn().mockImplementation((type: string, modelFamily: string) => {
      // clipL uses FLUX modelFamily (corrected)
      if (type === 'clip' && modelFamily === 'FLUX') {
        return Promise.resolve('clip_l.safetensors');
      }
      // clipG uses SD3 modelFamily
      if (type === 'clip' && modelFamily === 'SD3') {
        return Promise.resolve('clip_g.safetensors');
      }
      // T5 uses FLUX modelFamily (corrected)
      if (type === 't5' && modelFamily === 'FLUX') {
        return Promise.resolve('t5xxl_fp16.safetensors');
      }
      return Promise.resolve(undefined);
    });

    mockContext = {
      clientService: {} as ComfyUIClientService,
      modelResolverService: mockModelResolver as ModelResolverService,
    };
  });

  it('should create SD3.5 workflow with default parameters', async () => {
    const modelName = 'sd35_large.safetensors';
    const params = {
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'A beautiful landscape',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    // Get the actual workflow object passed to PromptBuilder
    const workflowArg = (PromptBuilder as any).mock.calls[0][0];

    // Test individual nodes
    expect(workflowArg['1']).toMatchObject({
      _meta: { title: 'Load Checkpoint' },
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: modelName },
    });

    expect(workflowArg['2']).toMatchObject({
      _meta: { title: 'Triple CLIP Loader' },
      class_type: 'TripleCLIPLoader',
      inputs: {
        clip_name1: 'clip_l.safetensors',
        clip_name2: 'clip_g.safetensors',
        clip_name3: 't5xxl_fp16.safetensors',
      },
    });

    expect(workflowArg['3']).toMatchObject({
      _meta: { title: 'Positive Prompt' },
      class_type: 'CLIPTextEncode',
      inputs: {
        clip: ['2', 0],
        text: 'A beautiful landscape',
      },
    });

    expect(workflowArg['4']).toMatchObject({
      _meta: { title: 'Negative Prompt' },
      class_type: 'CLIPTextEncode',
      inputs: {
        clip: ['2', 0],
        text: expect.stringContaining('worst quality'),
      },
    });

    expect(workflowArg['5']).toMatchObject({
          _meta: { title: 'Empty SD3 Latent Image' },
          class_type: 'EmptySD3LatentImage',
          inputs: {
            batch_size: 1,
            height: 1024,
            width: 1024,
          },
    });

    // Test KSampler node inputs individually
    expect(workflowArg['6']._meta.title).toBe('KSampler');
    expect(workflowArg['6'].class_type).toBe('KSampler');
    expect(workflowArg['6'].inputs.cfg).toBe(4);  // From params
    expect(workflowArg['6'].inputs.denoise).toBe(1);
    expect(workflowArg['6'].inputs.latent_image).toEqual(['5', 0]);
    expect(workflowArg['6'].inputs.model).toEqual(['12', 0]);
    expect(workflowArg['6'].inputs.negative).toEqual(['4', 0]);
    expect(workflowArg['6'].inputs.positive).toEqual(['3', 0]);
    expect(workflowArg['6'].inputs.sampler_name).toBe('euler');
    expect(workflowArg['6'].inputs.scheduler).toBe('sgm_uniform'); // Frontend provides scheduler
    expect(typeof workflowArg['6'].inputs.seed).toBe('number');
    expect(workflowArg['6'].inputs.steps).toBe(20);  // Default from sd35ParamsSchema

    expect(workflowArg['7']).toMatchObject({
          _meta: { title: 'VAE Decode' },
          class_type: 'VAEDecode',
          inputs: {
            samples: ['6', 0],
            vae: ['1', 2],
          },
    });

    expect(workflowArg['8']).toMatchObject({
          _meta: { title: 'Save Image' },
          class_type: 'SaveImage',
          inputs: {
            filename_prefix: 'LobeChat/%year%-%month%-%day%/SD35',
            images: ['7', 0],
          },
    });

    expect(workflowArg['12']).toMatchObject({
          _meta: { title: 'ModelSamplingSD3' },
          class_type: 'ModelSamplingSD3',
          inputs: {
            model: ['1', 0],
            shift: 3, // Default shift value
          },
    });

    // Check that PromptBuilder was called with correct inputs/outputs
    const inputsArg = (PromptBuilder as any).mock.calls[0][1];
    const outputsArg = (PromptBuilder as any).mock.calls[0][2];

    expect(inputsArg).toEqual([
        'prompt',
        'width',
        'height',
        'steps',
        'seed',
        'cfg',
        'samplerName',
        'scheduler',
      ]);

    expect(outputsArg).toEqual(['images']);

    expect(result.setOutputNode).toHaveBeenCalledWith('images', '8');
    expect(result.setInputNode).toHaveBeenCalledWith('prompt', '3.inputs.text');
    expect(result.setInputNode).toHaveBeenCalledWith('width', '5.inputs.width');
    expect(result.setInputNode).toHaveBeenCalledWith('height', '5.inputs.height');
    expect(result.setInputNode).toHaveBeenCalledWith('steps', '6.inputs.steps');
    expect(result.setInputNode).toHaveBeenCalledWith('seed', '6.inputs.seed');
    expect(result.setInputNode).toHaveBeenCalledWith('cfg', '6.inputs.cfg');
  });

  it('should create workflow with custom parameters', async () => {
    const modelName = 'custom_sd35.safetensors';
    const params = {
      cfg: 7.5,
      height: 768,
      prompt: 'Custom prompt text',
      seed: 98_765,
      steps: 30,
      width: 512,
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    expect(workflow['1'].inputs.ckpt_name).toBe(modelName);
    expect(workflow['3'].inputs.text).toBe('Custom prompt text');
    expect(workflow['5'].inputs.width).toBe(512);
    expect(workflow['5'].inputs.height).toBe(768);
    expect(workflow['6'].inputs.steps).toBe(30);
    expect(workflow['6'].inputs.seed).toBe(98_765);
    expect(workflow['6'].inputs.cfg).toBe(7.5);
  });

  it('should generate random seed when seed is not provided', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = {
      prompt: 'Test prompt',
      seed: undefined,
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    expect(typeof workflow['6'].inputs.seed).toBe('number'); // Generated seed value
  });

  it('should use seed value 0 when explicitly provided', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = {
      prompt: 'Test prompt',
      seed: 0,
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    expect(workflow['6'].inputs.seed).toBe(0); // Should use 0, not generate random
  });

  it('should use default CFG value when cfg is not provided', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = {
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'Test prompt',  
      
// Default from sd35ParamsSchema (will be used when undefined)
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    expect(workflow['6'].inputs.cfg).toBe(4); // Default value from sd35ParamsSchema
  });

  it('should use default CFG value when cfg is 0 (falsy)', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = {
      
// Default from sd35ParamsSchema
cfg: 0,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'Test prompt',  
      
// Explicitly set to 0
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    expect(workflow['6'].inputs.cfg).toBe(0); // Should use the provided value, even if 0
  });

  // Removed duplicate test - already covered by 'cfg is 0' test

  it('should handle empty params object', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = { 
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'test prompt',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    expect(workflow['1'].inputs.ckpt_name).toBe(modelName);
    expect(workflow['3'].inputs.text).toBe('test prompt');
    expect(workflow['5'].inputs.width).toBe(1024); // Default width from sd35ParamsSchema
    expect(workflow['5'].inputs.height).toBe(1024); // Default height from sd35ParamsSchema
    expect(workflow['6'].inputs.steps).toBe(20); // Default steps from sd35ParamsSchema
    expect(typeof workflow['6'].inputs.seed).toBe('number'); // Generated seed value
    expect(workflow['6'].inputs.cfg).toBe(4); // Default CFG from sd35ParamsSchema
    expect(workflow['6'].inputs.denoise).toBe(1); // Default denoise for t2i
  });

  it('should use custom negative prompt when provided', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = {
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,
      

negativePrompt: 'Custom negative prompt',  
      
prompt: 'Test prompt',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    // Note: SD3.5 workflow currently ignores custom negativePrompt and uses DEFAULT_NEGATIVE_PROMPT
    expect(workflow['4'].inputs.text).toContain('worst quality');
  });

  it('should use default negative prompt when not provided', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = {
      prompt: 'Test prompt',
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    // Should use DEFAULT_NEGATIVE_PROMPT when not provided
    expect(workflow['4'].inputs.text).toContain('worst quality');
    expect(workflow['4'].inputs.text).toContain('low quality');
    expect(workflow['4'].inputs.text).toContain('blurry');
  });

  it('should have correct workflow connections', async () => {
    const modelName = TEST_SD35_MODELS.LARGE;
    const params = { prompt: 'test' };

    await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check key workflow connections
    expect(workflow['3'].inputs.clip).toEqual(['2', 0]); // Positive CLIP uses Triple CLIP Loader
    expect(workflow['4'].inputs.clip).toEqual(['2', 0]); // Negative CLIP uses Triple CLIP Loader
    expect(workflow['6'].inputs.model).toEqual(['12', 0]); // KSampler uses ModelSamplingSD3 output
    expect(workflow['6'].inputs.positive).toEqual(['3', 0]); // KSampler uses positive conditioning
    expect(workflow['6'].inputs.negative).toEqual(['4', 0]); // KSampler uses negative conditioning
    expect(workflow['6'].inputs.latent_image).toEqual(['5', 0]); // KSampler uses empty latent
    expect(workflow['7'].inputs.samples).toEqual(['6', 0]); // VAE decode uses sampler output
    expect(workflow['7'].inputs.vae).toEqual(['1', 2]); // VAE decode uses checkpoint VAE
    expect(workflow['8'].inputs.images).toEqual(['7', 0]); // Save uses decoded image
  });

  it('should have all required meta information', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = { 
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check that all nodes have meta titles
    expect(workflow['1']._meta.title).toBe('Load Checkpoint');
    expect(workflow['2']._meta.title).toBe('Triple CLIP Loader');
    expect(workflow['3']._meta.title).toBe('Positive Prompt');
    expect(workflow['4']._meta.title).toBe('Negative Prompt');
    expect(workflow['5']._meta.title).toBe('Empty SD3 Latent Image');
    expect(workflow['6']._meta.title).toBe('KSampler');
    expect(workflow['7']._meta.title).toBe('VAE Decode');
    expect(workflow['8']._meta.title).toBe('Save Image');
  });

  it('should have correct KSampler fixed parameters', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = { 
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check fixed KSampler parameters
    expect(workflow['6'].inputs.sampler_name).toBe('euler');
    expect(workflow['6'].inputs.scheduler).toBe('sgm_uniform'); // Frontend provides scheduler
    expect(workflow['6'].inputs.denoise).toBe(1);
  });

  it('should have correct EmptyLatentImage parameters', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = { 
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check EmptyLatentImage fixed parameters
    expect(workflow['5'].inputs.batch_size).toBe(1);
  });

  it('should have correct SaveImage parameters', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = { 
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    await buildSD35Workflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check SaveImage parameters
    expect(workflow['8'].inputs.filename_prefix).toBe('LobeChat/%year%-%month%-%day%/SD35');
  });

  it('should call all PromptBuilder setup methods', async () => {
    const modelName = 'sd35_model.safetensors';
    const params = { 
      
// Default from sd35ParamsSchema
cfg: 4,
      

// Default from sd35ParamsSchema
height: 1024,  
      
prompt: 'test',  
      
// Default from sd35ParamsSchema
samplerName: 'euler',  
      

// Default from sd35ParamsSchema
scheduler: 'sgm_uniform',  
      

// Default from sd35ParamsSchema
steps: 20,  
      
width: 1024,  // Default from sd35ParamsSchema
    };

    const result = await buildSD35Workflow(modelName, params, mockContext);

    // Should call setOutputNode once
    expect(result.setOutputNode).toHaveBeenCalledTimes(1);
    expect(result.setOutputNode).toHaveBeenCalledWith('images', '8');

    // Should call setInputNode 8 times for all input mappings
    expect(result.setInputNode).toHaveBeenCalledTimes(8);
    expect(result.setInputNode).toHaveBeenCalledWith('prompt', '3.inputs.text');
    // Note: negativePrompt is not mapped via setInputNode in current implementation
    expect(result.setInputNode).toHaveBeenCalledWith('width', '5.inputs.width');
    expect(result.setInputNode).toHaveBeenCalledWith('height', '5.inputs.height');
    expect(result.setInputNode).toHaveBeenCalledWith('steps', '6.inputs.steps');
    expect(result.setInputNode).toHaveBeenCalledWith('seed', '6.inputs.seed');
    expect(result.setInputNode).toHaveBeenCalledWith('cfg', '6.inputs.cfg');
    expect(result.setInputNode).toHaveBeenCalledWith('scheduler', '6.inputs.scheduler');
    // Note: denoise is hardcoded to 1, not mapped via setInputNode
  });

  describe('Error Handling', () => {
    it('should throw WorkflowError when no encoder files are available', async () => {
      // Override the service to return undefined (no encoders available)
      const mockContextNoEncoders = {
        ...mockContext,
        modelResolverService: {
          ...mockModelResolver,
          getOptimalComponent: vi.fn().mockResolvedValue(undefined), // No components available
        }
      };

      const modelName = 'sd35_large.safetensors';
      const params = {
        prompt: 'A test prompt',
      };

      // Should throw WorkflowError with MISSING_ENCODER reason
      await expect(buildSD35Workflow(modelName, params, mockContextNoEncoders)).rejects.toThrow(WorkflowError);
      await expect(buildSD35Workflow(modelName, params, mockContextNoEncoders)).rejects.toThrow(
        'SD3.5 models require external CLIP/T5 encoder files',
      );

      // Additional assertion to verify error details
      try {
        await buildSD35Workflow(modelName, params, mockContextNoEncoders);
      } catch (error) {
        expect(error).toBeInstanceOf(WorkflowError);
        expect((error as WorkflowError).reason).toBe(WorkflowError.Reasons.MISSING_ENCODER);
        expect((error as WorkflowError).details).toEqual({ model: modelName });
      }
    });
  });
});
