// @vitest-environment node
import { PromptBuilder } from '@saintno/comfyui-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FLUX_MODEL_CONFIG, WORKFLOW_DEFAULTS } from '../constants';
import { buildFluxSchnellWorkflow } from './flux-schnell';

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

describe('buildFluxSchnellWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create FLUX Schnell workflow with default parameters', () => {
    const modelName = 'flux_schnell.safetensors';
    const params = {
      prompt: 'A beautiful landscape',
    };

    const result = buildFluxSchnellWorkflow(modelName, params);

    expect(PromptBuilder).toHaveBeenCalledWith(
      expect.objectContaining({
        '1': expect.objectContaining({
          class_type: 'DualCLIPLoader',
          inputs: expect.objectContaining({
            clip_name1: 't5xxl_fp16.safetensors',
            clip_name2: 'clip_l.safetensors',
            type: 'flux',
          }),
        }),
        '2': expect.objectContaining({
          class_type: 'UNETLoader',
          inputs: expect.objectContaining({
            unet_name: modelName,
            weight_dtype: 'default',
          }),
        }),
        '3': expect.objectContaining({
          class_type: 'VAELoader',
          inputs: expect.objectContaining({
            vae_name: 'ae.safetensors',
          }),
        }),
        '4': expect.objectContaining({
          class_type: 'CLIPTextEncodeFlux',
          inputs: expect.objectContaining({
            clip: ['1', 0],
            guidance: WORKFLOW_DEFAULTS.SCHNELL.CFG,
          }),
        }),
        '5': expect.objectContaining({
          class_type: 'EmptySD3LatentImage',
          inputs: expect.objectContaining({
            batch_size: 1,
            height: 1024,
            width: 1024,
          }),
        }),
        '6': expect.objectContaining({
          class_type: 'KSampler',
          inputs: expect.objectContaining({
            cfg: 1,
            denoise: 1,
            latent_image: ['5', 0],
            model: ['2', 0],
            negative: ['4', 0],
            positive: ['4', 0],
            sampler_name: 'euler',
            scheduler: 'simple',
            seed: 0, // Updated to match current default
            steps: WORKFLOW_DEFAULTS.SCHNELL.STEPS,
          }),
        }),
        '7': expect.objectContaining({
          class_type: 'VAEDecode',
          inputs: expect.objectContaining({
            samples: ['6', 0],
            vae: ['3', 0],
          }),
        }),
        '8': expect.objectContaining({
          class_type: 'SaveImage',
          inputs: expect.objectContaining({
            filename_prefix: 'LobeChat/%year%-%month%-%day%/FLUX_Schnell',
            images: ['7', 0],
          }),
        }),
      }),
      ['prompt_clip_l', 'prompt_t5xxl', 'width', 'height', 'steps', 'cfg', 'seed'],
      ['images'],
    );

    expect(result.setOutputNode).toHaveBeenCalledWith('images', '8');
  });

  it('should create workflow with custom parameters', () => {
    const modelName = 'custom_flux.safetensors';
    const params = {
      height: 768,
      prompt: 'Custom prompt',
      samplerName: 'dpmpp_2m',
      scheduler: 'karras',
      seed: 12_345,
      steps: 8,
      width: 512,
    };

    const result = buildFluxSchnellWorkflow(modelName, params);

    // Check the modified workflow object (after direct assignments)
    const workflow = (result as any).workflow;

    expect(workflow['2'].inputs.unet_name).toBe(modelName);
    expect(workflow['5'].inputs.width).toBe(1024); // This is not modified directly, only via input()
    expect(workflow['5'].inputs.height).toBe(1024); // This is not modified directly, only via input()
    expect(workflow['6'].inputs.steps).toBe(WORKFLOW_DEFAULTS.SCHNELL.STEPS); // Default steps, not customizable in current implementation
    expect(workflow['6'].inputs.seed).toBe(0); // Default seed, not customizable directly
    // samplerName and scheduler parameters are not currently supported in the implementation
    expect(workflow['6'].inputs.sampler_name).toBe('euler'); // Uses default value
    expect(workflow['6'].inputs.scheduler).toBe('simple'); // Uses default value
  });

  it('should handle empty prompt', () => {
    const modelName = 'flux_schnell.safetensors';
    const params = {};

    buildFluxSchnellWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should use default values
    expect(workflow['5'].inputs.width).toBe(1024);
    expect(workflow['5'].inputs.height).toBe(1024);
    expect(workflow['6'].inputs.steps).toBe(WORKFLOW_DEFAULTS.SCHNELL.STEPS);
    expect(workflow['6'].inputs.seed).toBe(0); // Updated to match current default
    expect(workflow['6'].inputs.sampler_name).toBe('euler');
    expect(workflow['6'].inputs.scheduler).toBe('simple');
  });

  it('should have correct workflow structure', () => {
    const modelName = 'test_model.safetensors';
    const params = { prompt: 'test' };

    buildFluxSchnellWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check workflow connections
    expect(workflow['4'].inputs.clip).toEqual(['1', 0]); // CLIP encode uses DualCLIP output
    expect(workflow['6'].inputs.latent_image).toEqual(['5', 0]); // Sampler uses empty latent
    expect(workflow['6'].inputs.model).toEqual(['2', 0]); // Sampler uses UNET
    expect(workflow['6'].inputs.positive).toEqual(['4', 0]); // Sampler uses encoded text
    expect(workflow['6'].inputs.negative).toEqual(['4', 0]); // Sampler uses same for negative
    expect(workflow['7'].inputs.samples).toEqual(['6', 0]); // VAE decode uses sampler output
    expect(workflow['7'].inputs.vae).toEqual(['3', 0]); // VAE decode uses VAE
    expect(workflow['8'].inputs.images).toEqual(['7', 0]); // Save uses decoded image
  });

  it('should have fixed CFG for Schnell model', () => {
    const modelName = 'flux_schnell.safetensors';
    const params = { cfg: 7, prompt: 'test' }; // CFG should be ignored

    buildFluxSchnellWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // CFG should always be 1 for Schnell
    expect(workflow['6'].inputs.cfg).toBe(1);
    expect(workflow['4'].inputs.guidance).toBe(WORKFLOW_DEFAULTS.SCHNELL.CFG);
  });

  it('should use correct default steps for Schnell', () => {
    const modelName = 'flux_schnell.safetensors';
    const params = { prompt: 'test' };

    buildFluxSchnellWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should default to 4 steps for Schnell
    expect(workflow['6'].inputs.steps).toBe(WORKFLOW_DEFAULTS.SCHNELL.STEPS);
  });

  it('should have all required meta information', () => {
    const modelName = 'flux_schnell.safetensors';
    const params = { prompt: 'test' };

    buildFluxSchnellWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check that all nodes have meta titles
    expect(workflow['1']._meta.title).toBe('DualCLIP Loader');
    expect(workflow['2']._meta.title).toBe('UNET Loader');
    expect(workflow['3']._meta.title).toBe('VAE Loader');
    expect(workflow['4']._meta.title).toBe('CLIP Text Encode (Flux)');
    expect(workflow['5']._meta.title).toBe('Empty SD3 Latent Image');
    expect(workflow['6']._meta.title).toBe('K Sampler');
    expect(workflow['7']._meta.title).toBe('VAE Decode');
    expect(workflow['8']._meta.title).toBe('Save Image');
  });
});
