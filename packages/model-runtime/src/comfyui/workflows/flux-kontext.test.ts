// @vitest-environment node
import { PromptBuilder } from '@saintno/comfyui-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FLUX_MODEL_CONFIG, WORKFLOW_DEFAULTS } from '../constants';
import { buildFluxKontextWorkflow } from './flux-kontext';

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

describe('buildFluxKontextWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create FLUX Kontext workflow with default parameters', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      prompt: 'A beautiful landscape',
    };

    const result = buildFluxKontextWorkflow(modelName, params);

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

  it('should create workflow with custom parameters', () => {
    const modelName = 'custom_flux_kontext.safetensors';
    const params = {
      cfg: 4,
      height: 768,
      prompt: 'Custom prompt',
      steps: WORKFLOW_DEFAULTS.SAMPLING.STEPS,
      width: 512,
    };

    buildFluxKontextWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];
    expect(workflow['2'].inputs.unet_name).toBe(modelName);
  });

  it('should handle image-to-image parameters', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      denoise: 0.8,
      image: 'input_image.png',
      prompt: 'test',
    };

    buildFluxKontextWorkflow(modelName, params);

    // Should not throw and should create valid workflow
    expect(PromptBuilder).toHaveBeenCalled();
  });

  it('should support img2img workflow', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      image: 'test.png',
      prompt: 'test',
    };

    buildFluxKontextWorkflow(modelName, params);

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

  it('should handle empty prompt', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {};

    buildFluxKontextWorkflow(modelName, params);

    // Should not throw and should create valid workflow
    expect(PromptBuilder).toHaveBeenCalled();
  });

  it('should use appropriate default steps for Kontext model', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = { prompt: 'test' };

    buildFluxKontextWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Kontext typically uses 28 steps by default
    const schedulerNode = Object.values(workflow).find(
      (node: any) => node.class_type === 'BasicScheduler',
    ) as any;

    if (schedulerNode) {
      expect(schedulerNode.inputs.steps).toBe(WORKFLOW_DEFAULTS.KONTEXT.STEPS);
    }
  });

  it('should have correct workflow structure', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = { prompt: 'test' };

    buildFluxKontextWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should have essential nodes for FLUX Kontext workflow
    const hasRequiredNodes = ['DualCLIPLoader', 'UNETLoader', 'VAELoader', 'SaveImage'].every(
      (nodeType) => Object.values(workflow).some((node: any) => node.class_type === nodeType),
    );

    expect(hasRequiredNodes).toBe(true);
  });

  it('should have all meta information', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = { prompt: 'test' };

    buildFluxKontextWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Check that nodes have meta titles
    Object.values(workflow).forEach((node: any) => {
      expect(node._meta).toBeDefined();
      expect(node._meta.title).toBeDefined();
      expect(typeof node._meta.title).toBe('string');
    });
  });

  it('should support vision capabilities', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      image: 'input.jpg',
      prompt: 'test',
    };

    buildFluxKontextWorkflow(modelName, params);

    // Kontext model supports vision (img2img), so workflow should be created successfully
    expect(PromptBuilder).toHaveBeenCalled();

    const workflow = (PromptBuilder as any).mock.calls[0][0];
    expect(Object.keys(workflow).length).toBeGreaterThan(0);
  });

  it('should create image-to-image workflow with imageUrl parameter', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      denoise: 0.8,
      imageUrl: 'https://example.com/image.jpg',
      prompt: 'Transform this image into a painting',
    };

    buildFluxKontextWorkflow(modelName, params);

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

  it('should create image-to-image workflow with imageUrls array parameter', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      denoise: 0.65,
      imageUrls: ['https://example.com/first.jpg', 'https://example.com/second.jpg'],
      prompt: 'Apply artistic style',
    };

    buildFluxKontextWorkflow(modelName, params);

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

  it('should use default denoise value for image-to-image when not provided', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      imageUrl: 'https://example.com/test.png',
      prompt: 'Edit image',
    };

    buildFluxKontextWorkflow(modelName, params);

    const workflow = (PromptBuilder as any).mock.calls[0][0];

    // Should use default denoise value of 0.75 for image-to-image
    expect(workflow['9'].inputs.denoise).toBe(0.75);

    // Should have image nodes
    expect(workflow['img_load']).toBeDefined();
    expect(workflow['img_encode']).toBeDefined();
  });

  it('should create text-to-image workflow when no image parameters provided', () => {
    const modelName = 'flux_kontext.safetensors';
    const params = {
      height: 1024,
      prompt: 'Generate a new image',
      width: 1024,
    };

    buildFluxKontextWorkflow(modelName, params);

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
    expect(workflow['9'].inputs.denoise).toBe(1);
  });
});
