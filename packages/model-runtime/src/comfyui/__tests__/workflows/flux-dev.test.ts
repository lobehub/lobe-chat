// @vitest-environment node
import { PromptBuilder } from '@saintno/comfyui-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_FLUX_MODELS } from '../constants/testModels';

import { WORKFLOW_DEFAULTS } from '../../constants';
import { buildFluxDevWorkflow } from '../../workflows/flux-dev';
// Import mock context from helper
import { mockContext } from '../helpers/mockContext';

// Mock the model resolver that the WorkflowDetector uses
vi.mock('../../utils/modelResolver', () => ({
  resolveModel: vi.fn((modelName: string) => {
    const cleanName = modelName.replace(/^comfyui\//, '');

    // Mock configuration mapping for FLUX test models
    if (
      cleanName.includes('flux_dev') ||
      cleanName.includes('flux-dev') ||
      cleanName === TEST_FLUX_MODELS.DEV
    ) {
      return {
        family: 'flux',
        modelFamily: 'FLUX',
        variant: 'dev',
      };
    }

    return null;
  }),
}));

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

describe('buildFluxDevWorkflow', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create FLUX Dev workflow with default parameters', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = {
      
// Default from fluxDevParamsSchema  
cfg: 3.5,
      

// Default from fluxDevParamsSchema
height: 1024,  
      
prompt: 'A beautiful landscape',  
      
// Default from fluxDevParamsSchema
samplerName: 'euler',  
      

// Default from fluxDevParamsSchema
scheduler: 'simple',  
      

// Default from fluxDevParamsSchema
steps: 20,  
      
width: 1024,  // Default from fluxDevParamsSchema
    };

    const result = await buildFluxDevWorkflow(modelName, params, mockContext);

    expect(PromptBuilder).toHaveBeenCalledWith(
      expect.objectContaining({
        '5': expect.objectContaining({
          class_type: 'CLIPTextEncodeFlux',
          inputs: expect.objectContaining({
            clip: ['1', 0],
            clip_l: 'A beautiful landscape',
            // ✅ 验证prompt正确设置
            guidance: 3.5, // Frontend provides CFG
            // ✅ 验证prompt正确设置
            t5xxl: 'A beautiful landscape',
          }),
        }),
      }),
      ['width', 'height', 'steps', 'cfg', 'seed', 'samplerName', 'scheduler'], // ✅ 修复后的参数列表
      ['images'],
    );

    expect(result.setOutputNode).toHaveBeenCalledWith('images', '12');
  });

  it('should create workflow with custom parameters', async () => {
    const modelName = 'custom_flux_dev.safetensors';
    const params = {
      cfg: 4.5,
      height: 768,
      prompt: 'Custom prompt',
      samplerName: 'dpmpp_2m',
      scheduler: 'karras',
      steps: 25, // Frontend provides steps
      width: 512,
    };

    const result = await buildFluxDevWorkflow(modelName, params, mockContext);

    // Check the modified workflow object (after direct assignments)
    const workflow = (result as any).workflow;

    expect(workflow['2'].inputs.unet_name).toBe(modelName);
    expect(workflow['4'].inputs.width).toBe(512); // ✅ 直接设置到工作流
    expect(workflow['4'].inputs.height).toBe(768); // ✅ 直接设置到工作流
    expect(workflow['7'].inputs.width).toBe(512); // ✅ 修复: 现在直接设置
    expect(workflow['7'].inputs.height).toBe(768); // ✅ 修复: 现在直接设置
    expect(workflow['9'].inputs.steps).toBe(25); // Frontend provides steps
    expect(workflow['5'].inputs.guidance).toBe(4.5); // ✅ 直接设置到工作流
    expect(workflow['6'].inputs.guidance).toBe(4.5); // ✅ 修复: 现在直接设置
    // ✅ samplerName and scheduler parameters are now supported
    expect(workflow['8'].inputs.sampler_name).toBe('dpmpp_2m'); // Uses custom value
    expect(workflow['9'].inputs.scheduler).toBe('karras'); // Uses custom value
  });

  it('should handle empty prompt', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = {
      
// Default from fluxDevParamsSchema
cfg: 3.5,  
      

// Default from fluxDevParamsSchema
height: 1024,  
      

prompt: '',  
      

// Default from fluxDevParamsSchema
samplerName: 'euler',  
      


// Default from fluxDevParamsSchema
scheduler: 'simple',  
      


// Default from fluxDevParamsSchema
steps: 20,  
      
// Empty prompt
width: 1024,  // Default from fluxDevParamsSchema
    };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should use default values
    expect(workflow['4'].inputs.width).toBe(1024);
    expect(workflow['4'].inputs.height).toBe(1024);
    expect(workflow['7'].inputs.width).toBe(1024);
    expect(workflow['7'].inputs.height).toBe(1024);
    expect(workflow['9'].inputs.steps).toBe(20); // Frontend provides steps
    expect(workflow['5'].inputs.guidance).toBe(3.5); // Frontend provides CFG
    expect(workflow['6'].inputs.guidance).toBe(3.5); // Frontend provides CFG
    expect(workflow['8'].inputs.sampler_name).toBe('euler');
    expect(workflow['9'].inputs.scheduler).toBe('simple'); // Frontend provides scheduler
  });

  it('should have correct workflow connections', async () => {
    const modelName = TEST_FLUX_MODELS.DEV;
    const params = { prompt: 'test' };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check key workflow connections
    expect(workflow['4'].inputs.model).toEqual(['2', 0]); // ModelSamplingFlux uses UNET
    expect(workflow['5'].inputs.clip).toEqual(['1', 0]); // CLIP encode uses DualCLIP output
    expect(workflow['6'].inputs.conditioning).toEqual(['5', 0]); // FluxGuidance uses CLIP output
    expect(workflow['9'].inputs.model).toEqual(['4', 0]); // Scheduler uses sampling model
    expect(workflow['10'].inputs.latent_image).toEqual(['7', 0]); // Sampler uses empty latent
    expect(workflow['10'].inputs.guider).toEqual(['14', 0]); // Sampler uses BasicGuider output (handles model/conditioning)
    expect(workflow['10'].inputs.noise).toEqual(['13', 0]); // Sampler uses random noise
    expect(workflow['10'].inputs.sampler).toEqual(['8', 0]); // Sampler uses KSamplerSelect
    expect(workflow['10'].inputs.sigmas).toEqual(['9', 0]); // Sampler uses BasicScheduler sigmas
    expect(workflow['14'].inputs.conditioning).toEqual(['6', 0]); // BasicGuider uses FluxGuidance conditioning
    expect(workflow['14'].inputs.model).toEqual(['4', 0]); // BasicGuider uses sampling model
    expect(workflow['11'].inputs.samples).toEqual(['10', 0]); // VAE decode uses sampler output
    expect(workflow['11'].inputs.vae).toEqual(['3', 0]); // VAE decode uses VAE
    expect(workflow['12'].inputs.images).toEqual(['11', 0]); // Save uses decoded image
  });

  it('should use variable CFG for Dev model', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { cfg: 5, prompt: 'test' };

    const result = await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    // CFG should be configurable for Dev - both nodes are now set directly
    expect(workflow['5'].inputs.guidance).toBe(5);
    expect(workflow['6'].inputs.guidance).toBe(5); // ✅ 修复: 现在直接设置
  });

  it('should use correct default steps for Dev', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { 
      cfg: 3.5,
      height: 1024,
      prompt: 'test',
      samplerName: 'euler',
      scheduler: 'simple',
      steps: 20,
      width: 1024
    };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should default to 20 steps for Dev
    expect(workflow['9'].inputs.steps).toBe(20); // Frontend provides steps
  });

  it('should have model sampling flux configuration', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { height: 512, prompt: 'test', width: 768 };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    expect(workflow['4'].class_type).toBe('ModelSamplingFlux');
    expect(workflow['4'].inputs.max_shift).toBe(WORKFLOW_DEFAULTS.SAMPLING.MAX_SHIFT);
    expect(workflow['4'].inputs.base_shift).toBe(0.5);
    expect(workflow['4'].inputs.width).toBe(768);
    expect(workflow['4'].inputs.height).toBe(512);
  });

  it('should use advanced sampler workflow', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { prompt: 'test' };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Dev uses SamplerCustomAdvanced instead of KSampler
    expect(workflow['10'].class_type).toBe('SamplerCustomAdvanced');
    expect(workflow['8'].class_type).toBe('KSamplerSelect');
    expect(workflow['9'].class_type).toBe('BasicScheduler');
  });

  it('should have flux guidance node', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { cfg: 4, prompt: 'test' };

    const result = await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (result as any).workflow;

    expect(workflow['6'].class_type).toBe('FluxGuidance');
    expect(workflow['6'].inputs.guidance).toBe(4); // ✅ 修复: 现在直接设置
    expect(workflow['6'].inputs.conditioning).toEqual(['5', 0]);
  });

  it('should have all required meta information', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { prompt: 'test' };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check that all nodes have meta titles
    expect(workflow['1']._meta.title).toBe('DualCLIP Loader');
    expect(workflow['2']._meta.title).toBe('UNET Loader');
    expect(workflow['3']._meta.title).toBe('VAE Loader');
    expect(workflow['4']._meta.title).toBe('Model Sampling Flux');
    expect(workflow['5']._meta.title).toBe('CLIP Text Encode (Flux)');
    expect(workflow['6']._meta.title).toBe('Flux Guidance');
    expect(workflow['7']._meta.title).toBe('Empty SD3 Latent Image');
    expect(workflow['8']._meta.title).toBe('K Sampler Select');
    expect(workflow['9']._meta.title).toBe('Basic Scheduler');
    expect(workflow['10']._meta.title).toBe('Sampler Custom Advanced');
    expect(workflow['11']._meta.title).toBe('VAE Decode');
    expect(workflow['12']._meta.title).toBe('Save Image');
    expect(workflow['13']._meta.title).toBe('Random Noise');
    expect(workflow['14']._meta.title).toBe('Basic Guider');
  });

  it('should set denoise to 1 in scheduler', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { prompt: 'test' };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    expect(workflow['9'].inputs.denoise).toBe(1);
  });

  it('should support custom sampler configuration', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = {
      prompt: 'test',
      samplerName: 'dpmpp_2m_sde',
      scheduler: 'karras',
    };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    expect(workflow['8'].inputs.sampler_name).toBe('dpmpp_2m_sde');
    expect(workflow['9'].inputs.scheduler).toBe('karras');
  });

  it('should use default sampler configuration when not provided', async () => {
    const modelName = 'flux_dev.safetensors';
    const params = { 
      cfg: 3.5,
      height: 1024,
      prompt: 'test',
      samplerName: 'euler',
      scheduler: 'simple',
      steps: 20,
      width: 1024
    };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    expect(workflow['8'].inputs.sampler_name).toBe('euler'); // Frontend provides sampler
    expect(workflow['9'].inputs.scheduler).toBe('simple'); // Frontend provides scheduler
  });

  it('should handle Krea-style parameters via parameterized Dev template', async () => {
    const modelName = 'flux_krea_dev.safetensors';
    const params = {
      cfg: 3.5,
      prompt: 'photographic portrait',
      samplerName: 'dpmpp_2m_sde',
      scheduler: 'karras',
      steps: 15,
    };

    await buildFluxDevWorkflow(modelName, params, mockContext);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should handle Krea-style configuration through Dev template
    expect(workflow['5'].inputs.guidance).toBe(3.5);
    expect(workflow['6'].inputs.guidance).toBe(3.5);
    expect(workflow['9'].inputs.steps).toBe(15);
    expect(workflow['8'].inputs.sampler_name).toBe('dpmpp_2m_sde');
    expect(workflow['9'].inputs.scheduler).toBe('karras');
  });
});
