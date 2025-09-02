// @vitest-environment node
import { CallWrapper, ComfyApi, PromptBuilder } from '@saintno/comfyui-sdk';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../../../types/error';
import { CreateImagePayload } from '../../../types/image';
import { ModelResolverError } from '../../errors/modelResolverError';
import { LobeComfyUI } from '../../index';
import { WorkflowDetector } from '../../utils/workflowDetector';
import { setupAllMocks } from '../setup/unifiedMocks';

// Mock the ComfyUI services for error handling tests
let mockClientService: any;
let mockModelResolverService: any;
let mockWorkflowBuilderService: any;

vi.mock('../../services/comfyuiClient', () => {
  const MockComfyUIClientService = vi.fn().mockImplementation(() => {
    mockClientService = {
      executeWorkflow: vi.fn().mockImplementation((workflow, onProgress) => {
        return new Promise((resolve) => {
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
              ckpt_name: [['flux-schnell.safetensors', 'flux-dev.safetensors']],
            },
          },
        },
      }),
      getPathImage: vi.fn().mockReturnValue('http://localhost:8188/view?filename=test.png'),
      validateConnection: vi.fn().mockResolvedValue(true),
    };
    return mockClientService;
  });
  return { ComfyUIClientService: MockComfyUIClientService };
});

vi.mock('../../services/modelResolver', () => {
  const MockModelResolverService = vi.fn().mockImplementation(() => {
    mockModelResolverService = {
      clearCache: vi.fn(),
      getAvailableModelFiles: vi.fn().mockResolvedValue(['flux-schnell.safetensors']),
      resolveModelFileName: vi.fn().mockResolvedValue('test.safetensors'),
      selectComponents: vi.fn().mockResolvedValue({
        clip: ['clip_l.safetensors', 'clip_g.safetensors'],
        t5: 't5xxl_fp16.safetensors',
      }),
      selectVAE: vi.fn().mockResolvedValue(undefined),
      validateModel: vi.fn().mockImplementation((modelId: string) => {
        if (modelId.includes('unknown')) {
          return Promise.resolve({ exists: false });
        }
        const fileName = modelId.split('/').pop() || modelId;
        return Promise.resolve({ actualFileName: fileName + '.safetensors', exists: true });
      }),
    };
    return mockModelResolverService;
  });
  return { ModelResolverService: MockModelResolverService };
});

vi.mock('../../services/workflowBuilder', () => {
  const MockWorkflowBuilderService = vi.fn().mockImplementation(() => {
    mockWorkflowBuilderService = {
      buildWorkflow: vi.fn().mockImplementation(() => ({
        input: vi.fn().mockReturnThis(),
        prompt: { '1': { class_type: 'CheckpointLoaderSimple' } },
        setInputNode: vi.fn().mockReturnThis(),
        setOutputNode: vi.fn().mockReturnThis(),
      })),
    };
    return mockWorkflowBuilderService;
  });
  return { WorkflowBuilderService: MockWorkflowBuilderService };
});

const workflowErrorType = 'ComfyUIWorkflowError';
const emptyResultErrorType = AgentRuntimeErrorType.ComfyUIBizError;
const serviceUnavailableErrorType = 'ComfyUIServiceUnavailable';
const modelNotFoundErrorType = 'ModelNotFound';

describe('LobeComfyUI - Error Handling', () => {
  const { inputCalls } = setupAllMocks();
  let instance: LobeComfyUI;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock global fetch
    global.fetch = vi.fn() as Mock;

    vi.spyOn(WorkflowDetector, 'detectModelType').mockImplementation(() => ({
      architecture: 'FLUX',
      isSupported: true,
      variant: 'schnell',
    }));

    instance = new LobeComfyUI({ apiKey: 'test-key' });
  });

  describe('Model Validation Errors', () => {
    it('should throw ModelNotFound error when validation fails', async () => {
      // Mock service to throw ModelResolverError for model not found
      const { ModelResolverError } = await import('../../errors/modelResolverError');
      mockModelResolverService.validateModel.mockRejectedValue(
        new ModelResolverError(
          ModelResolverError.Reasons.MODEL_NOT_FOUND,
          'Model not found: comfyui/unknown-model',
          { modelId: 'comfyui/unknown-model' },
        ),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/unknown-model',
        params: {
          prompt: 'Test no models',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: modelNotFoundErrorType,
      });
    });

    it('should handle authentication errors during validation', async () => {
      // Mock service to throw authentication error - the ensureConnection method calls validateConnection
      mockClientService.validateConnection.mockRejectedValue(
        new ModelResolverError(ModelResolverError.Reasons.INVALID_API_KEY, 'Authentication failed'),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: { prompt: 'Test auth error' },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
        provider: 'comfyui',
      });
    });

    it('should validate even with authType=none', async () => {
      const noneAuthInstance = new LobeComfyUI({
        authType: 'none',
        baseURL: 'http://secure-server:8188',
      });

      // Mock validation to fail for this instance
      mockClientService.validateConnection.mockRejectedValue(
        new ModelResolverError(ModelResolverError.Reasons.PERMISSION_DENIED, 'Access denied'),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: { prompt: 'Test none auth validation' },
      };

      await expect(noneAuthInstance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.PermissionDenied,
        provider: 'comfyui',
      });
    });
  });

  describe('Workflow Execution Errors', () => {
    it('should throw ComfyUIEmptyResult when no images are generated', async () => {
      // Mock successful validation
      mockModelResolverService.validateModel.mockResolvedValue({
        actualFileName: 'flux-schnell.safetensors',
        exists: true,
      });

      // Mock workflow execution to return empty images
      mockClientService.executeWorkflow.mockResolvedValue({
        images: {
          images: [], // Empty images array
        },
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test no images generated',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: emptyResultErrorType,
        provider: 'comfyui',
      });
    });

    it('should throw ComfyUIWorkflowError when workflow fails', async () => {
      // Mock successful validation
      mockModelResolverService.validateModel.mockResolvedValue({
        actualFileName: 'flux-schnell.safetensors',
        exists: true,
      });

      // Mock workflow execution to reject
      mockClientService.executeWorkflow.mockRejectedValue(new Error('Workflow execution failed'));

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test workflow failure',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: workflowErrorType,
        provider: 'comfyui',
      });
    });

    it('should throw ComfyUIEmptyResult when result.images is null or undefined', async () => {
      // Mock successful validation
      mockModelResolverService.validateModel.mockResolvedValue({
        actualFileName: 'flux-schnell.safetensors',
        exists: true,
      });

      // Mock workflow execution to return empty result
      mockClientService.executeWorkflow.mockResolvedValue({});

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test missing images key',
        },
      };

      await expect(instance.createImage(payload)).rejects.toEqual({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: emptyResultErrorType,
        provider: 'comfyui',
      });
    });
  });

  describe('Connection and Network Errors', () => {
    it('should throw ComfyUIServiceUnavailable for ECONNREFUSED', async () => {
      mockClientService.validateConnection.mockRejectedValue(
        new ModelResolverError(
          ModelResolverError.Reasons.CONNECTION_ERROR,
          'connect ECONNREFUSED 127.0.0.1:8188',
        ),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test connection error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
        provider: 'comfyui',
      });
    }, 10_000);

    it('should throw ComfyUIServiceUnavailable for fetch failed', async () => {
      // Mock successful validation but failed execution
      mockModelResolverService.validateModel.mockResolvedValue({
        actualFileName: 'flux-schnell.safetensors',
        exists: true,
      });

      mockClientService.executeWorkflow.mockRejectedValue(new Error('fetch failed'));

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test fetch error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: serviceUnavailableErrorType,
        provider: 'comfyui',
      });
    });

    it('should handle network errors gracefully', async () => {
      mockClientService.validateConnection.mockRejectedValue(new Error('Network timeout'));

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test network error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: 'Network timeout',
        }),
        errorType: AgentRuntimeErrorType.ComfyUIBizError,
        provider: 'comfyui',
      });
    }, 5000);
  });

  describe('Authentication Errors', () => {
    it('should throw InvalidProviderAPIKey for 401 status with basic auth', async () => {
      const comfyuiWithBasicAuth = new LobeComfyUI({
        authType: 'basic',
        baseURL: 'http://localhost:8188',
        password: 'pass',
        username: 'user',
      });

      mockClientService.validateConnection.mockRejectedValue(
        new ModelResolverError(ModelResolverError.Reasons.INVALID_API_KEY, 'Unauthorized'),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test auth error',
        },
      };

      await expect(comfyuiWithBasicAuth.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
        provider: 'comfyui',
      });
    }, 10_000);

    it('should throw InvalidProviderAPIKey for 401 status with bearer token', async () => {
      const comfyuiWithBearer = new LobeComfyUI({
        apiKey: 'invalid-token',
        authType: 'bearer',
        baseURL: 'http://localhost:8188',
      });

      mockClientService.validateConnection.mockRejectedValue(
        new ModelResolverError(ModelResolverError.Reasons.INVALID_API_KEY, 'Unauthorized'),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test bearer auth error',
        },
      };

      await expect(comfyuiWithBearer.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
        provider: 'comfyui',
      });
    }, 10_000);

    it('should throw PermissionDenied for 403 status', async () => {
      mockClientService.validateConnection.mockRejectedValue(
        new ModelResolverError(ModelResolverError.Reasons.PERMISSION_DENIED, 'Forbidden'),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test permission error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.PermissionDenied,
        provider: 'comfyui',
      });
    }, 10_000);
  });

  describe('Server Errors', () => {
    it('should throw ComfyUIServiceUnavailable for server errors', async () => {
      // Mock successful validation
      mockModelResolverService.validateModel.mockResolvedValue({
        actualFileName: 'flux-schnell.safetensors',
        exists: true,
      });

      mockClientService.executeWorkflow.mockRejectedValue(
        new ModelResolverError(
          ModelResolverError.Reasons.SERVICE_UNAVAILABLE,
          'Internal Server Error',
        ),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test server error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: serviceUnavailableErrorType,
        provider: 'comfyui',
      });
    });

    it('should re-throw existing AgentRuntimeError', async () => {
      // Mock successful validation
      mockModelResolverService.validateModel.mockResolvedValue({
        actualFileName: 'flux-schnell.safetensors',
        exists: true,
      });

      const existingError = {
        error: { message: 'Custom error' },
        errorType: 'CustomError',
      };

      mockClientService.executeWorkflow.mockRejectedValue(existingError);

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test existing error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toEqual(existingError);
    });

    it('should throw ModelNotFound error for validation failure', async () => {
      mockModelResolverService.validateModel.mockRejectedValue(
        new ModelResolverError(
          ModelResolverError.Reasons.MODEL_NOT_FOUND,
          'Validation failed: server response malformed',
        ),
      );

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test validation failure',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: modelNotFoundErrorType,
      });
    });
  });
});
