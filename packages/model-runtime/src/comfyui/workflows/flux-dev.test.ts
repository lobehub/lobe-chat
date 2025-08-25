// @vitest-environment node
import { PromptBuilder } from '@saintno/comfyui-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FLUX_MODEL_CONFIG, WORKFLOW_DEFAULTS } from '../constants';
import { buildFluxDevWorkflow } from './flux-dev';

// Mock the utility functions
vi.mock('../utils/prompt-splitter', () => ({
  splitPromptForDualCLIP: vi.fn((prompt: string) => ({
    clipLPrompt: prompt,
    t5xxlPrompt: prompt,
  })),
}));

vi.mock('../utils/weight-dtype', () => ({
  selectOptimalWeightDtype: vi.fn(() => 'default'),
}));

// Mock PromptBuilder and seed function - capture constructor arguments for test access
vi.mock('@saintno/comfyui-sdk', () => ({
  PromptBuilder: vi.fn().mockImplementation((workflow, inputs, outputs) => {
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

describe('buildFluxDevWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create FLUX Dev workflow with default parameters', () => {
    const modelName = 'flux_dev.safetensors';
    const params = {
      prompt: 'A beautiful landscape',
    };

    const result = buildFluxDevWorkflow(modelName, params);

    expect(PromptBuilder).toHaveBeenCalledWith(
      expect.objectContaining({
        '5': expect.objectContaining({
          class_type: 'CLIPTextEncodeFlux',
          inputs: expect.objectContaining({
            clip: ['1', 0],
            clip_l: 'landscape',
            // ✅ 验证prompt正确设置
            guidance: WORKFLOW_DEFAULTS.SAMPLING.CFG,
            // ✅ 验证prompt正确设置
            t5xxl: 'A beautiful landscape',
          }),
        }),
      }),
      ['width', 'height', 'steps', 'cfg', 'seed'], // ✅ 修复后的参数列表
      ['images'],
    );

    expect(result.setOutputNode).toHaveBeenCalledWith('images', '12');
  });

  it('should create workflow with custom parameters', () => {
    const modelName = 'custom_flux_dev.safetensors';
    const params = {
      cfg: 4.5,
      height: 768,
      prompt: 'Custom prompt',
      samplerName: 'dpmpp_2m',
      scheduler: 'karras',
      steps: WORKFLOW_DEFAULTS.SAMPLING.STEPS,
      width: 512,
    };

    const result = buildFluxDevWorkflow(modelName, params);

    // Check the modified workflow object (after direct assignments)
    const workflow = (result as any).workflow;

    expect(workflow['2'].inputs.unet_name).toBe(modelName);
    expect(workflow['4'].inputs.width).toBe(512); // ✅ 直接设置到工作流
    expect(workflow['4'].inputs.height).toBe(768); // ✅ 直接设置到工作流
    expect(workflow['7'].inputs.width).toBe(512); // ✅ 修复: 现在直接设置
    expect(workflow['7'].inputs.height).toBe(768); // ✅ 修复: 现在直接设置
    expect(workflow['9'].inputs.steps).toBe(WORKFLOW_DEFAULTS.SAMPLING.STEPS);
    expect(workflow['5'].inputs.guidance).toBe(4.5); // ✅ 直接设置到工作流
    expect(workflow['6'].inputs.guidance).toBe(4.5); // ✅ 修复: 现在直接设置
    // samplerName and scheduler parameters are not currently supported in the implementation
    expect(workflow['8'].inputs.sampler_name).toBe('euler'); // Uses default value
    expect(workflow['9'].inputs.scheduler).toBe('simple'); // Uses default value
  });

  it('should handle empty prompt', () => {
    const modelName = 'flux_dev.safetensors';
    const params = {};

    buildFluxDevWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should use default values
    expect(workflow['4'].inputs.width).toBe(WORKFLOW_DEFAULTS.IMAGE.WIDTH);
    expect(workflow['4'].inputs.height).toBe(WORKFLOW_DEFAULTS.IMAGE.HEIGHT);
    expect(workflow['7'].inputs.width).toBe(WORKFLOW_DEFAULTS.IMAGE.WIDTH);
    expect(workflow['7'].inputs.height).toBe(WORKFLOW_DEFAULTS.IMAGE.HEIGHT);
    expect(workflow['9'].inputs.steps).toBe(WORKFLOW_DEFAULTS.SAMPLING.STEPS);
    expect(workflow['5'].inputs.guidance).toBe(WORKFLOW_DEFAULTS.SAMPLING.CFG);
    expect(workflow['6'].inputs.guidance).toBe(WORKFLOW_DEFAULTS.SAMPLING.CFG);
    expect(workflow['8'].inputs.sampler_name).toBe('euler');
    expect(workflow['9'].inputs.scheduler).toBe('simple');
  });

  it('should have correct workflow connections', () => {
    const modelName = 'test_model.safetensors';
    const params = { prompt: 'test' };

    buildFluxDevWorkflow(modelName, params);

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

  it('should use variable CFG for Dev model', () => {
    const modelName = 'flux_dev.safetensors';
    const params = { cfg: 5, prompt: 'test' };

    const result = buildFluxDevWorkflow(modelName, params);

    const workflow = (result as any).workflow;

    // CFG should be configurable for Dev - both nodes are now set directly
    expect(workflow['5'].inputs.guidance).toBe(5);
    expect(workflow['6'].inputs.guidance).toBe(5); // ✅ 修复: 现在直接设置
  });

  it('should use correct default steps for Dev', () => {
    const modelName = 'flux_dev.safetensors';
    const params = { prompt: 'test' };

    buildFluxDevWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should default to 25 steps for Dev
    expect(workflow['9'].inputs.steps).toBe(WORKFLOW_DEFAULTS.SAMPLING.STEPS);
  });

  it('should have model sampling flux configuration', () => {
    const modelName = 'flux_dev.safetensors';
    const params = { height: 512, prompt: 'test', width: 768 };

    buildFluxDevWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    expect(workflow['4'].class_type).toBe('ModelSamplingFlux');
    expect(workflow['4'].inputs.max_shift).toBe(WORKFLOW_DEFAULTS.SAMPLING.MAX_SHIFT);
    expect(workflow['4'].inputs.base_shift).toBe(0.5);
    expect(workflow['4'].inputs.width).toBe(768);
    expect(workflow['4'].inputs.height).toBe(512);
  });

  it('should use advanced sampler workflow', () => {
    const modelName = 'flux_dev.safetensors';
    const params = { prompt: 'test' };

    buildFluxDevWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Dev uses SamplerCustomAdvanced instead of KSampler
    expect(workflow['10'].class_type).toBe('SamplerCustomAdvanced');
    expect(workflow['8'].class_type).toBe('KSamplerSelect');
    expect(workflow['9'].class_type).toBe('BasicScheduler');
  });

  it('should have flux guidance node', () => {
    const modelName = 'flux_dev.safetensors';
    const params = { cfg: 4, prompt: 'test' };

    const result = buildFluxDevWorkflow(modelName, params);

    const workflow = (result as any).workflow;

    expect(workflow['6'].class_type).toBe('FluxGuidance');
    expect(workflow['6'].inputs.guidance).toBe(4); // ✅ 修复: 现在直接设置
    expect(workflow['6'].inputs.conditioning).toEqual(['5', 0]);
  });

  it('should have all required meta information', () => {
    const modelName = 'flux_dev.safetensors';
    const params = { prompt: 'test' };

    buildFluxDevWorkflow(modelName, params);

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

  it('should set denoise to 1 in scheduler', () => {
    const modelName = 'flux_dev.safetensors';
    const params = { prompt: 'test' };

    buildFluxDevWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    expect(workflow['9'].inputs.denoise).toBe(1);
  });
});
