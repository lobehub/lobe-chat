// @vitest-environment node
import { CallWrapper, ComfyApi, PromptBuilder } from '@saintno/comfyui-sdk';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateImagePayload } from '../../../types/image';
import { processModelList } from '../../../utils/modelParse';
import { LobeComfyUI } from '../../index';
import { WorkflowDetector } from '../../utils/workflowDetector';
import { setupAllMocks } from '../setup/unifiedMocks';

// Mock the ComfyUI services
vi.mock('../../services/comfyuiClient', () => {
  const MockComfyUIClientService = vi.fn().mockImplementation(() => ({
    executeWorkflow: vi.fn().mockImplementation((workflow, onProgress) => {
      return new Promise((resolve) => {
        // Simulate successful execution
        onProgress?.({ progress: 100 });
        resolve({
          images: {
            images: [
              {
                filename: 'test.png',
                height: 1024,
                width: 1024,
              },
            ],
          },
        });
      });
    }),
    getObjectInfo: vi.fn().mockResolvedValue({
      CheckpointLoaderSimple: {
        input: {
          required: {
            ckpt_name: [['flux-schnell.safetensors', 'flux-dev.safetensors', 'sd15-base.ckpt']],
          },
        },
      },
    }),
    getPathImage: vi.fn().mockReturnValue('http://localhost:8188/view?filename=test.png'),
    validateConnection: vi.fn().mockResolvedValue(true),
  }));
  return { ComfyUIClientService: MockComfyUIClientService };
});

vi.mock('../../services/modelResolver', () => {
  const MockModelResolverService = vi.fn().mockImplementation(() => ({
    clearCache: vi.fn(),
    getAvailableModelFiles: vi
      .fn()
      .mockResolvedValue(['flux-schnell.safetensors', 'flux-dev.safetensors', 'sd15-base.ckpt']),
    resolveModelFileName: vi.fn().mockImplementation((modelId: string) => {
      if (
        modelId.includes('non-existent') ||
        modelId.includes('unknown') ||
        modelId.includes('non-verified')
      ) {
        return Promise.reject(new Error(`Model not found: ${modelId}`));
      }
      const fileName = modelId.split('/').pop() || modelId;
      return Promise.resolve(fileName + '.safetensors');
    }),
    selectComponents: vi.fn().mockResolvedValue({
      clip: ['clip_l.safetensors', 'clip_g.safetensors'],
      t5: 't5xxl_fp16.safetensors',
    }),
    selectVAE: vi.fn().mockResolvedValue(undefined),
    validateModel: vi.fn().mockImplementation((modelId: string) => {
      if (
        modelId.includes('non-existent') ||
        modelId.includes('unknown') ||
        modelId.includes('non-verified')
      ) {
        return Promise.resolve({ exists: false });
      }
      const fileName = modelId.split('/').pop() || modelId;
      return Promise.resolve({ actualFileName: fileName + '.safetensors', exists: true });
    }),
  }));
  return { ModelResolverService: MockModelResolverService };
});

vi.mock('../../services/workflowBuilder', () => {
  const MockWorkflowBuilderService = vi.fn().mockImplementation(() => ({
    buildWorkflow: vi.fn().mockImplementation(() => {
      return {
        input: vi.fn().mockReturnThis(),
        prompt: {
          '1': {
            _meta: { title: 'Checkpoint Loader' },
            class_type: 'CheckpointLoaderSimple',
            inputs: { ckpt_name: 'test.safetensors' },
          },
        },
        setInputNode: vi.fn().mockReturnThis(),
        setOutputNode: vi.fn().mockReturnThis(),
      };
    }),
  }));
  return { WorkflowBuilderService: MockWorkflowBuilderService };
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock WorkflowDetector
vi.mock('../../utils/workflowDetector', () => ({
  WorkflowDetector: {
    detectModelType: vi.fn(),
  },
}));

// Mock processModels utility
vi.mock('../../../utils/modelParse', () => ({
  MODEL_LIST_CONFIGS: {
    comfyui: {
      id: 'comfyui',
      modelList: [],
    },
  },
  detectModelProvider: vi.fn().mockImplementation((modelId: string) => {
    if (modelId.includes('claude')) return 'anthropic';
    if (modelId.includes('gpt')) return 'openai';
    if (modelId.includes('gemini')) return 'google';
    return 'unknown';
  }),
  processModelList: vi.fn(),
}));

// Mock the workflows
const createMockBuilder = () => ({
  input: vi.fn().mockReturnThis(),
  prompt: {
    '1': {
      _meta: { title: 'Checkpoint Loader' },
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: 'test.safetensors' },
    },
  },
  setInputNode: vi.fn().mockReturnThis(),
  setOutputNode: vi.fn().mockReturnThis(),
});

vi.mock('../../workflows', () => ({
  buildFluxDevWorkflow: vi.fn().mockImplementation(() => createMockBuilder()),
  buildFluxKontextWorkflow: vi.fn().mockImplementation(() => createMockBuilder()),
  buildFluxKreaWorkflow: vi.fn().mockImplementation(() => createMockBuilder()),
  buildFluxSchnellWorkflow: vi.fn().mockImplementation(() => createMockBuilder()),
  buildSD35NoClipWorkflow: vi.fn().mockImplementation(() => createMockBuilder()),
  buildSD35Workflow: vi.fn().mockImplementation(() => createMockBuilder()),
}));

// Mock WorkflowRouter
vi.mock('../../utils/workflowRouter', () => ({
  WorkflowRouter: {
    getExactlySupportedModels: () => ['comfyui/flux-dev', 'comfyui/flux-schnell'],
    getSupportedFluxVariants: () => ['dev', 'schnell', 'kontext', 'krea'],
    routeWorkflow: () => createMockBuilder(),
  },
  WorkflowRoutingError: class extends Error {
    constructor(message?: string) {
      super(message);
      this.name = 'WorkflowRoutingError';
    }
  },
}));

// Mock systemComponents
vi.mock('../../config/systemComponents', () => ({
  getAllComponentsWithNames: vi.fn().mockImplementation((options: any) => {
    if (options?.type === 'clip') {
      return [
        { config: { priority: 1 }, name: 'clip_l.safetensors' },
        { config: { priority: 2 }, name: 'clip_g.safetensors' },
      ];
    }
    if (options?.type === 't5') {
      return [{ config: { priority: 1 }, name: 't5xxl_fp16.safetensors' }];
    }
    return [];
  }),
  getOptimalComponent: vi.fn().mockImplementation((type: string) => {
    if (type === 't5') return 't5xxl_fp16.safetensors';
    if (type === 'vae') return 'ae.safetensors';
    if (type === 'clip') return 'clip_l.safetensors';
    return 'default.safetensors';
  }),
}));

describe('LobeComfyUI - Core Functionality', () => {
  let instance: LobeComfyUI;
  let inputCalls: Map<string, any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mocks = setupAllMocks();
    inputCalls = mocks.inputCalls;

    // ModelResolver service is mocked at module level

    // Setup WorkflowDetector default behavior
    vi.spyOn(WorkflowDetector, 'detectModelType').mockImplementation((modelFileName: string) => {
      if (modelFileName.includes('flux')) {
        if (modelFileName.includes('dev')) {
          return { architecture: 'FLUX', isSupported: true, variant: 'dev' };
        }
        if (modelFileName.includes('schnell')) {
          return { architecture: 'FLUX', isSupported: true, variant: 'schnell' };
        }
        return { architecture: 'FLUX', isSupported: true, variant: 'schnell' };
      }
      if (modelFileName.includes('sd35')) {
        return { architecture: 'SD3' as const, isSupported: true, variant: 'sd35' };
      }
      if (modelFileName.includes('sd') || modelFileName.includes('xl')) {
        return { architecture: 'SDXL' as const, isSupported: true, variant: undefined };
      }
      return { architecture: 'FLUX', isSupported: true, variant: 'schnell' };
    });

    // Setup processModelList default behavior
    vi.mocked(processModelList).mockImplementation(async (modelList: any) => {
      return modelList.map((model: any) => ({
        ...model,
        contextWindowTokens: undefined,
        description: '',
        displayName: model.id,
        functionCall: false,
        maxOutput: undefined,
        reasoning: false,
        releasedAt: undefined,
        type: 'chat' as const,
        vision: false,
      }));
    });

    instance = new LobeComfyUI({ apiKey: 'test-key' });
  });

  describe('createImage() - Basic Functionality', () => {
    it('should successfully create image with FLUX Schnell model', async () => {
      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          height: 1024,
          prompt: 'A beautiful landscape',
          steps: 4,
          width: 1024,
        },
      };

      const result = await instance.createImage(payload);

      expect(result).toEqual({
        imageUrl: 'http://localhost:8188/view?filename=test.png',
      });
    });

    it('should successfully create image with FLUX Dev model', async () => {
      const payload: CreateImagePayload = {
        model: 'comfyui/flux-dev',
        params: {
          cfg: 3.5,
          height: 1024,
          prompt: 'A beautiful landscape',
          steps: 20,
          width: 1024,
        },
      };

      const result = await instance.createImage(payload);

      expect(result).toEqual({
        imageUrl: 'http://localhost:8188/view?filename=test.png',
      });
    });

    it('should use generic SD workflow for non-FLUX models', async () => {
      const payload: CreateImagePayload = {
        model: 'comfyui/stable-diffusion-xl',
        params: {
          cfg: 7,
          height: 512,
          prompt: 'A beautiful landscape',
          steps: 20,
          width: 512,
        },
      };

      const result = await instance.createImage(payload);

      expect(result).toEqual({
        imageUrl: 'http://localhost:8188/view?filename=test.png',
      });
    });

    it('should use default parameters when not provided', async () => {
      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Minimal parameters test',
        },
      };

      const result = await instance.createImage(payload);

      // Should return a valid result
      expect(result).toEqual({
        imageUrl: 'http://localhost:8188/view?filename=test.png',
      });
    });

    it('should use fallback dimensions when not provided in response', async () => {
      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          height: 768,
          prompt: 'Test fallback dimensions',
          width: 512,
        },
      };

      const result = await instance.createImage(payload);

      expect(result).toEqual({
        imageUrl: 'http://localhost:8188/view?filename=test.png',
      });
    });
  });

  describe('Model Matching and Resolution', () => {
    it('should handle exact model matching', async () => {
      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test exact matching',
        },
      };

      await instance.createImage(payload);

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should handle fuzzy model matching with keywords', async () => {
      const payload: CreateImagePayload = {
        model: 'comfyui/flux-test',
        params: {
          prompt: 'Test fuzzy matching',
        },
      };

      await instance.createImage(payload);

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });
});
