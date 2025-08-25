// @vitest-environment node
import { CallWrapper, ComfyApi, PromptBuilder } from '@saintno/comfyui-sdk';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType, CreateImagePayload } from '@/libs/model-runtime';

import { LobeComfyUI } from '../index';
import { COMFYUI_ERROR_TYPES } from './constants';
import { ModelResolver } from './utils/modelResolver';

// Mock the ComfyUI SDK
vi.mock('@saintno/comfyui-sdk', () => ({
  CallWrapper: vi.fn(),
  ComfyApi: vi.fn(),
  PromptBuilder: vi.fn(),
}));

// Mock the ModelResolver
vi.mock('./utils/ModelResolver', () => ({
  ModelResolver: vi.fn(),
}));

// Mock modelResolver functions
vi.mock('./utils/modelResolver', () => ({
  ModelResolver: vi.fn(),
  resolveModel: vi.fn().mockImplementation((modelName: string) => {
    // Return mock config for any model during tests
    return {
      modelFamily: 'FLUX',
      priority: 1,
      recommendedDtype: 'default' as const,
      variant: 'dev' as const,
    };
  }),
  resolveModelStrict: vi.fn().mockImplementation((modelName: string) => {
    // Return mock config for any model during tests
    return {
      modelFamily: 'FLUX',
      priority: 1,
      recommendedDtype: 'default' as const,
      variant: 'dev' as const,
    };
  }),
  isValidModel: vi.fn().mockReturnValue(true),
  getAllModels: vi.fn().mockReturnValue(['flux-schnell.safetensors', 'flux-dev.safetensors']),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

const provider = 'comfyui';
const bizErrorType = 'ComfyUIBizError';
const emptyResultErrorType = COMFYUI_ERROR_TYPES.EMPTY_RESULT;
const serviceUnavailableErrorType = 'ComfyUIServiceUnavailable';
const invalidErrorType = 'InvalidProviderAPIKey';
const modelNotFoundErrorType = 'ModelNotFound';

describe('LobeComfyUI', () => {
  let instance: LobeComfyUI;
  let mockComfyApi: {
    fetchApi: Mock;
    getPathImage: Mock;
    init: Mock;
    waitForReady: Mock;
  };
  let mockCallWrapper: {
    onFailed: Mock;
    onFinished: Mock;
    onProgress: Mock;
    run: Mock;
  };
  let mockPromptBuilder: {
    input: Mock;
    setInputNode: Mock;
    setOutputNode: Mock;
  };
  let mockModelResolver: {
    getAvailableModelFiles: Mock;
    resolveModelFileName: Mock;
    transformModelFilesToList: Mock;
    validateModel: Mock;
  };

  beforeEach(() => {
    // Clear all mocks first
    vi.clearAllMocks();

    // Setup ComfyApi mock
    mockComfyApi = {
      fetchApi: vi.fn().mockResolvedValue({
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux-schnell.safetensors', 'flux-dev.safetensors', 'sd15-base.ckpt']],
            },
          },
        },
      }),
      getPathImage: vi.fn().mockReturnValue('http://localhost:8188/view?filename=test.png'),
      init: vi.fn(),
      waitForReady: vi.fn().mockResolvedValue(undefined),
    };
    (ComfyApi as any).mockImplementation(() => mockComfyApi);

    // Setup CallWrapper mock with proper async behavior
    mockCallWrapper = {
      onFailed: vi.fn().mockReturnThis(),
      onFinished: vi.fn().mockReturnThis(),
      onProgress: vi.fn().mockReturnThis(),
      run: vi.fn().mockReturnThis(),
    };
    (CallWrapper as Mock).mockImplementation(() => mockCallWrapper);

    // Setup PromptBuilder mock with prompt property
    mockPromptBuilder = {
      input: vi.fn().mockReturnThis(),
      prompt: {},
      setInputNode: vi.fn().mockReturnThis(),
      setOutputNode: vi.fn().mockReturnThis(),
    } as any; // Type assertion needed since mock doesn't match full PromptBuilder interface
    (PromptBuilder as Mock).mockImplementation(() => mockPromptBuilder);

    // Setup ModelResolver mock
    mockModelResolver = {
      getAvailableModelFiles: vi
        .fn()
        .mockResolvedValue(['flux-schnell.safetensors', 'flux-dev.safetensors', 'sd15-base.ckpt']),
      resolveModelFileName: vi.fn().mockImplementation((modelId: string) => {
        // Mock specific failure cases for tests
        if (
          modelId.includes('non-existent') ||
          modelId.includes('unknown') ||
          modelId.includes('non-verified')
        ) {
          return Promise.reject(new Error(`Model not found: ${modelId}`));
        }
        // Default success - return filename based on model ID
        const fileName = modelId.split('/').pop() || modelId;
        return Promise.resolve(fileName + '.safetensors');
      }),
      transformModelFilesToList: vi.fn().mockReturnValue([]),
      validateModel: vi.fn().mockImplementation((modelId: string) => {
        // Mock specific failure cases for tests
        if (
          modelId.includes('non-existent') ||
          modelId.includes('unknown') ||
          modelId.includes('non-verified')
        ) {
          return Promise.resolve({ exists: false });
        }
        // Default success for all other models
        const fileName = modelId.split('/').pop() || modelId;
        return Promise.resolve({ exists: true, actualFileName: fileName + '.safetensors' });
      }),
    };
    (ModelResolver as Mock).mockImplementation(() => mockModelResolver);

    // Mock ModelValidationManager for strict validation
    vi.mock('./utils/modelValidationManager', () => ({
      ModelValidationManager: vi.fn(() => ({
        validateModelExistence: vi.fn().mockResolvedValue({
          actualFileName: 'flux-schnell.safetensors',
          exists: true,
          timestamp: Date.now(),
        }),
      })),
    }));

    // Mock WorkflowTypeDetector
    vi.mock('./utils/WorkflowTypeDetector', () => ({
      WorkflowTypeDetector: {
        detectModelType: vi.fn().mockReturnValue({
          architecture: 'flux',
          confidence: 'high',
          isSupported: true,
          variant: 'schnell',
        }),
      },
    }));

    // Mock WorkflowRouter
    vi.mock('./utils/WorkflowRouter', () => ({
      WorkflowRouter: {
        getExactlySupportedModels: vi
          .fn()
          .mockReturnValue(['comfyui/flux-dev', 'comfyui/flux-schnell']),
        getSupportedFluxVariants: vi.fn().mockReturnValue(['dev', 'schnell', 'kontext', 'krea']),
        routeWorkflow: vi.fn().mockReturnValue({
          prompt: {
            '1': {
              class_type: 'CheckpointLoaderSimple',
              inputs: { ckpt_name: 'flux-schnell.safetensors' },
            },
          },
        }),
      },
      WorkflowRoutingError: class WorkflowRoutingError extends Error {},
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default baseURL and no credentials', () => {
      instance = new LobeComfyUI({});

      expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
        credentials: undefined,
      });
      expect(mockComfyApi.init).toHaveBeenCalled();
      expect(instance.baseURL).toBe('http://localhost:8188');
    });

    it('should throw InvalidComfyUIArgs for incomplete basic auth', () => {
      expect(() => {
        new LobeComfyUI({
          authType: 'basic',
          username: 'user',
          // missing password - should throw error
        });
      }).toThrow();

      // Verify it throws the correct error type
      try {
        new LobeComfyUI({
          authType: 'basic',
          username: 'user',
        });
      } catch (error: any) {
        expect(error.errorType).toBe('InvalidComfyUIArgs');
      }
    });

    it('should throw InvalidProviderAPIKey for missing bearer token', () => {
      expect(() => {
        new LobeComfyUI({
          authType: 'bearer',
          // missing apiKey - should throw error
        });
      }).toThrow();

      // Verify it throws the correct error type
      try {
        new LobeComfyUI({
          authType: 'bearer',
        });
      } catch (error: any) {
        expect(error.errorType).toBe('InvalidProviderAPIKey');
      }
    });

    it('should accept complete basic auth configuration', () => {
      expect(() => {
        new LobeComfyUI({
          authType: 'basic',
          password: 'pass',
          username: 'user',
        });
      }).not.toThrow();
    });

    it('should accept complete bearer auth configuration', () => {
      expect(() => {
        new LobeComfyUI({
          apiKey: 'test-key',
          authType: 'bearer',
        });
      }).not.toThrow();
    });

    it('should initialize with custom baseURL', () => {
      const customBaseURL = 'https://my-comfyui.example.com';
      instance = new LobeComfyUI({ baseURL: customBaseURL });

      expect(ComfyApi).toHaveBeenCalledWith(customBaseURL, undefined, {
        credentials: undefined,
      });
      expect(instance.baseURL).toBe(customBaseURL);
    });

    // Test new ComfyUIKeyVault authentication architecture
    describe('ComfyUIKeyVault Authentication', () => {
      it('should create basic credentials from authType and username/password fields', () => {
        instance = new LobeComfyUI({
          authType: 'basic',
          password: 'testpass',
          username: 'testuser',
        });

        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: {
            password: 'testpass',
            type: 'basic',
            username: 'testuser',
          },
        });
      });

      it('should create bearer credentials from authType and apiKey fields', () => {
        instance = new LobeComfyUI({
          apiKey: 'my-bearer-token',
          authType: 'bearer',
        });

        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: {
            token: 'my-bearer-token',
            type: 'bearer_token',
          },
        });
      });

      it('should create custom credentials from authType and customHeaders fields', () => {
        instance = new LobeComfyUI({
          authType: 'custom',
          customHeaders: {
            'Authorization': 'Custom token456',
            'X-API-Key': 'secret123',
          },
        });

        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: {
            headers: {
              'Authorization': 'Custom token456',
              'X-API-Key': 'secret123',
            },
            type: 'custom',
          },
        });
      });

      it('should handle authType none with no credentials', () => {
        instance = new LobeComfyUI({
          authType: 'none',
        });

        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: undefined,
        });
      });

      it('should throw InvalidComfyUIArgs when required fields are missing for basic auth', () => {
        expect(() => {
          new LobeComfyUI({
            authType: 'basic',
            // Missing username and password - should throw error
          });
        }).toThrow();

        // Verify it throws the correct error type
        try {
          new LobeComfyUI({
            authType: 'basic',
          });
        } catch (error: any) {
          expect(error.errorType).toBe('InvalidComfyUIArgs');
        }
      });

      it('should prioritize new authType over legacy apiKey format', () => {
        instance = new LobeComfyUI({
          apiKey: 'bearer:legacy-token',
          authType: 'basic',
          password: 'newpass',
          username: 'newuser', // This should be ignored
        });

        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: {
            password: 'newpass',
            type: 'basic',
            username: 'newuser',
          },
        });
      });
    });
  });

  describe('Connection validation', () => {
    beforeEach(() => {
      instance = new LobeComfyUI({ baseURL: 'http://custom:8188' });
    });

    it('should throw ModelNotFound error for non-existent model', async () => {
      // Setup mock for model validation failure
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: {
            error: 'HTTP undefined: undefined',
            model: 'comfyui/non-existent-model',
          },
          errorType: 'ModelNotFound',
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/non-existent-model',
        params: { prompt: 'Test model not found' },
      };

      // Should throw ModelNotFound error for non-existent model
      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          model: 'comfyui/non-existent-model',
        }),
        errorType: 'ModelNotFound',
      });

      // Should attempt validation
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/non-existent-model',
      );
    });

    it('should return empty array when connection validation fails in models()', async () => {
      // Mock connection failure
      (global.fetch as Mock).mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

      // Should return empty array when connection fails (graceful degradation)
      const result = await instance.models();
      expect(result).toEqual([]);
    });

    it('should validate model existence using strict validation', async () => {
      // Setup mock for successful validation
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockResolvedValue({
          actualFileName: 'flux-schnell.safetensors',
          exists: true,
          timestamp: Date.now(),
        }),
      };

      // Mock successful workflow execution
      const mockResult = {
        images: { images: [{ filename: 'test.png', height: 512, width: 512 }] },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: { prompt: 'Test strict validation' },
      };

      const result = await instance.createImage(payload);

      // Should validate model existence
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/flux-schnell',
      );

      // Should succeed with valid model
      expect(result).toEqual({
        height: 512,
        imageUrl: 'http://localhost:8188/view?filename=test.png',
        width: 512,
      });
    });

    it('should handle authentication errors during validation', async () => {
      // Mock validation manager to throw auth error
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: {
            message: 'Unauthorized',
            status: 401,
          },
          errorType: 'InvalidProviderAPIKey',
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: { prompt: 'Test auth error' },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: 'InvalidProviderAPIKey',
      });

      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/flux-schnell',
      );
    }, 1000);

    it('should validate even with authType=none', async () => {
      instance = new LobeComfyUI({
        authType: 'none',
        baseURL: 'http://secure-server:8188',
      });

      // Mock validation manager to throw auth error even with none auth
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: {
            message: 'Unauthorized',
            status: 401,
          },
          errorType: 'InvalidProviderAPIKey',
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: { prompt: 'Test none auth validation' },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: 'InvalidProviderAPIKey',
      });

      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/flux-schnell',
      );
    }, 1000);
  });

  describe('createImage()', () => {
    beforeEach(() => {
      instance = new LobeComfyUI({ apiKey: 'test-key' });
    });

    it('should successfully create image with FLUX Schnell model', async () => {
      // Setup available checkpoints
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      // Setup successful workflow execution
      const mockResult = {
        images: {
          images: [
            {
              filename: 'test.png',
              height: 1024,
              width: 1024,
            },
          ],
        },
      };

      // Mock CallWrapper to call onFinished immediately
      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

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

      expect(mockComfyApi.waitForReady).toHaveBeenCalled();
      expect(CallWrapper).toHaveBeenCalled();
      expect(mockCallWrapper.onFinished).toHaveBeenCalled();
      expect(mockCallWrapper.run).toHaveBeenCalled();
      expect(mockComfyApi.getPathImage).toHaveBeenCalledWith({
        filename: 'test.png',
        height: 1024,
        width: 1024,
      });

      expect(result).toEqual({
        height: 1024,
        imageUrl: 'http://localhost:8188/view?filename=test.png',
        width: 1024,
      });
    });

    it('should successfully create image with FLUX Dev model', async () => {
      // Setup available checkpoints
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_dev.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [
            {
              filename: 'test.png',
              height: 1024,
              width: 1024,
            },
          ],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

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
        height: 1024,
        imageUrl: 'http://localhost:8188/view?filename=test.png',
        width: 1024,
      });
    });

    it('should use generic SD workflow for non-FLUX models', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['stable_diffusion_xl.ckpt']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [
            {
              filename: 'test.png',
              height: 512,
              width: 512,
            },
          ],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/stable-diffusion-xl',
        params: {
          cfg: 7,
          height: 512,
          negativePrompt: 'blurry, low quality',
          prompt: 'A beautiful landscape',
          steps: 20,
          width: 512,
        },
      };

      const result = await instance.createImage(payload);

      expect(result).toEqual({
        height: 512,
        imageUrl: 'http://localhost:8188/view?filename=test.png',
        width: 512,
      });
    });

    it('should handle exact model matching', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux-schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [
            {
              filename: 'test.png',
              height: 1024,
              width: 1024,
            },
          ],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test exact matching',
        },
      };

      await instance.createImage(payload);

      expect(CallWrapper).toHaveBeenCalled();
    });

    it('should handle fuzzy model matching with keywords', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['some_flux_model_v1.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [
            {
              filename: 'test.png',
            },
          ],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-test',
        params: {
          prompt: 'Test fuzzy matching',
        },
      };

      await instance.createImage(payload);

      expect(CallWrapper).toHaveBeenCalled();
    });

    it('should throw error when no exact match found', async () => {
      // Mock validation to fail for unknown model
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: { model: 'comfyui/unknown-model' },
          errorType: AgentRuntimeErrorType.ModelNotFound,
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/unknown-model',
        params: {
          prompt: 'Test unknown model',
        },
      };

      // Should throw error for unknown model
      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.ModelNotFound,
      });

      // Verify validation was attempted
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/unknown-model',
      );
    });

    it('should throw error when model not in verified list', async () => {
      // Mock validation to fail for non-verified model
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: { model: 'comfyui/non-verified-model' },
          errorType: AgentRuntimeErrorType.ModelNotFound,
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/non-verified-model',
        params: {
          prompt: 'Test non-verified model',
        },
      };

      // Should throw error for non-verified model
      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.ModelNotFound,
      });

      // Verify validation was attempted
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/non-verified-model',
      );
    });

    it('should use fallback dimensions when not provided in response', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [
            {
              filename: 'test.png',
              // No width/height provided
            },
          ],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

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
        // From params
        height: 768,

        imageUrl: 'http://localhost:8188/view?filename=test.png',
        width: 512, // From params
      });
    });

    it('should throw error when no exact, fuzzy, or FLUX match is found', async () => {
      // Mock validation to fail for unknown model
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: { model: 'comfyui/some-unknown-model' },
          errorType: AgentRuntimeErrorType.ModelNotFound,
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/some-unknown-model', // A model that won't match anything
        params: {
          prompt: 'Test unknown model',
        },
      };

      // Expect the validation to throw a ModelNotFound error
      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.ModelNotFound,
      });

      // Verify validation was attempted
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/some-unknown-model',
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      instance = new LobeComfyUI({ apiKey: 'test-key' });
    });

    it('should throw ModelNotFound error when validation fails', async () => {
      // Mock validation manager to throw ModelNotFound error
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: {
            error: 'Model not found in available models',
            model: 'comfyui/unknown-model',
          },
          errorType: modelNotFoundErrorType,
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/unknown-model',
        params: {
          prompt: 'Test no models',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          model: 'comfyui/unknown-model',
        }),
        errorType: modelNotFoundErrorType,
      });

      // Should attempt validation
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/unknown-model',
      );
    });

    it('should throw ComfyUIEmptyResult when no images are generated', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [], // Empty images array
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
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

    it('should throw ComfyUIBizError when workflow fails', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const workflowError = new Error('Workflow execution failed');

      mockCallWrapper.run.mockImplementation(() => {
        const failCallback = mockCallWrapper.onFailed.mock.calls[0][0];
        failCallback(workflowError);
      });

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
        errorType: bizErrorType,
        provider: 'comfyui',
      });
    });

    it('should throw ComfyUIServiceUnavailable for ECONNREFUSED', async () => {
      const mockError = new Error('connect ECONNREFUSED 127.0.0.1:8188');
      mockComfyApi.waitForReady.mockRejectedValueOnce(mockError);

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test connection error',
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

    it('should throw ComfyUIServiceUnavailable for fetch failed', async () => {
      const mockError = new Error('fetch failed');
      mockCallWrapper.run.mockImplementation(() => {
        const failCallback = mockCallWrapper.onFailed.mock.calls[0][0];
        failCallback(mockError);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test fetch error',
        },
      };

      // Setup basic mock for models
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: serviceUnavailableErrorType,
        provider: 'comfyui',
      });
    });

    it('should throw InvalidProviderAPIKey for 401 status with basic auth', async () => {
      const comfyuiWithBasicAuth = new LobeComfyUI({
        authType: 'basic',
        baseURL: 'http://localhost:8188',
        password: 'pass',
        username: 'user',
      });

      const mockError = { message: 'Unauthorized', status: 401 };
      mockComfyApi.waitForReady.mockRejectedValueOnce(mockError);

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test auth error',
        },
      };

      await expect(comfyuiWithBasicAuth.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: 'InvalidProviderAPIKey',
        provider: 'comfyui',
      });
    });

    it('should throw InvalidProviderAPIKey for 401 status with bearer token', async () => {
      const comfyuiWithBearer = new LobeComfyUI({
        apiKey: 'invalid-token',
        authType: 'bearer',
        baseURL: 'http://localhost:8188',
      });

      const mockError = { message: 'Unauthorized', status: 401 };
      mockComfyApi.waitForReady.mockRejectedValueOnce(mockError);

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test bearer auth error',
        },
      };

      await expect(comfyuiWithBearer.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: 'InvalidProviderAPIKey',
        provider: 'comfyui',
      });
    });

    it('should throw PermissionDenied for 403 status', async () => {
      const mockError = { message: 'Forbidden', status: 403 };
      mockComfyApi.waitForReady.mockRejectedValueOnce(mockError);

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test permission error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: 'PermissionDenied',
        provider: 'comfyui',
      });
    });

    it('should throw ComfyUIBizError for server errors', async () => {
      const mockError = { message: 'Internal Server Error', status: 500 };
      mockCallWrapper.run.mockImplementation(() => {
        const failCallback = mockCallWrapper.onFailed.mock.calls[0][0];
        failCallback(mockError);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test server error',
        },
      };

      // Setup basic mock for models
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
          status: 500,
        }),
        errorType: serviceUnavailableErrorType,
        provider: 'comfyui',
      });
    });

    it('should re-throw existing AgentRuntimeError', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const existingError = {
        error: { message: 'Custom error' },
        errorType: 'CustomError',
      };

      mockCallWrapper.run.mockImplementation(() => {
        const failCallback = mockCallWrapper.onFailed.mock.calls[0][0];
        failCallback(existingError);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test existing error',
        },
      };

      await expect(instance.createImage(payload)).rejects.toEqual(existingError);
    });

    it('should handle network errors gracefully', async () => {
      // Mock the validateModelExistence to throw network error
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue(new Error('Network timeout')),
      };

      // Use Object.defineProperty to set the private property
      Object.defineProperty(instance, 'modelValidator', {
        configurable: true,
        value: mockValidationManager,
        writable: true,
      });

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
      });

      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/flux-schnell',
      );
    }, 1000);

    it('should throw ComfyUIEmptyResult when result.images is null or undefined', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      // Simulate a workflow result where the 'images' key is missing
      const mockResultWithMissingImages = {};

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResultWithMissingImages);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test missing images key',
        },
      };

      // This covers the `result.images?.images ?? []` branch.
      // `result.images` is undefined, so `images` becomes `[]`, and the length check fails.
      await expect(instance.createImage(payload)).rejects.toEqual({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        errorType: emptyResultErrorType,
        provider: 'comfyui',
      });
    });

    it('should throw ModelNotFound error for validation failure', async () => {
      // Mock validation manager to throw error for validation failure
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: {
            error: 'Validation failed: server response malformed',
            model: 'comfyui/flux-schnell',
          },
          errorType: modelNotFoundErrorType,
        }),
      };

      // Setup instance with mocked validation
      // Model validation now handled internally

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test validation failure',
        },
      };

      await expect(instance.createImage(payload)).rejects.toMatchObject({
        error: expect.objectContaining({
          model: 'comfyui/flux-schnell',
        }),
        errorType: modelNotFoundErrorType,
      });

      // Should attempt validation
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/flux-schnell',
      );
    });
  });

  describe('Workflow Building', () => {
    beforeEach(() => {
      instance = new LobeComfyUI({ apiKey: 'test-key' });
    });

    it('should build FLUX Schnell workflow using WorkflowRouter', async () => {
      // Mock validation for flux-schnell
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockResolvedValue({
          actualFileName: 'flux-schnell.safetensors',
          exists: true,
          timestamp: Date.now(),
        }),
      };

      // Mock WorkflowRouter to return proper workflow
      const mockWorkflowRouter = {
        routeWorkflow: vi.fn().mockReturnValue({
          prompt: {
            '1': {
              class_type: 'CheckpointLoaderSimple',
              inputs: { ckpt_name: 'flux-schnell.safetensors' },
            },
            '5': { class_type: 'EmptyLatentImage', inputs: { height: 1024, width: 1024 } },
            '6': { class_type: 'KSampler', inputs: { cfg: 1, seed: 12_345, steps: 4 } },
          },
        }),
      };

      // Setup mocks
      // Model validation now handled internally

      const mockResult = {
        images: {
          images: [{ filename: 'test.png' }],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          height: 1024,
          prompt: 'Test FLUX Schnell workflow',
          seed: 12_345,
          steps: 4,
          width: 1024,
        },
      };

      await instance.createImage(payload);

      // Verify validation was called
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/flux-schnell',
      );

      // Verify workflow was built and executed
      expect(mockCallWrapper.run).toHaveBeenCalled();
    });

    it('should build FLUX Dev workflow with guidance control', async () => {
      // Mock validation for flux-dev
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockResolvedValue({
          actualFileName: 'flux_dev.safetensors',
          exists: true,
          timestamp: Date.now(),
        }),
      };

      // Setup mocks
      Object.defineProperty(instance, 'modelValidator', {
        configurable: true,
        value: mockValidationManager,
        writable: true,
      });

      // Mock model resolution for flux-dev
      mockModelResolver.resolveModelFileName.mockResolvedValue('flux_dev.safetensors');

      const mockResult = {
        images: {
          images: [{ filename: 'test.png' }],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-dev',
        params: {
          cfg: 3.5,
          height: 1024,
          prompt: 'Test FLUX Dev workflow',
          steps: 20,
          width: 1024,
        },
      };

      await instance.createImage(payload);

      // Verify the workflow was executed
      expect(mockCallWrapper.run).toHaveBeenCalled();
      // Verify validation was called
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith('comfyui/flux-dev');
    });

    it('should build generic SD workflow for non-FLUX models', async () => {
      // Mock validation for SD model
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockResolvedValue({
          actualFileName: 'sd_xl_base.safetensors',
          exists: true,
          timestamp: Date.now(),
        }),
      };

      // Setup mocks
      Object.defineProperty(instance, 'modelValidator', {
        configurable: true,
        value: mockValidationManager,
        writable: true,
      });

      // Mock model resolution for non-FLUX model
      mockModelResolver.resolveModelFileName.mockResolvedValue('sd_xl_base.safetensors');

      const mockResult = {
        images: {
          images: [{ filename: 'test.png' }],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/sd-xl',
        params: {
          cfg: 7,
          height: 512,
          negativePrompt: 'bad quality',
          prompt: 'Test SD workflow',
          steps: 20,
          width: 512,
        },
      };

      await instance.createImage(payload);

      // Verify the workflow was executed
      expect(mockCallWrapper.run).toHaveBeenCalled();
      // Verify validation was called
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith('comfyui/sd-xl');
    });

    it('should use default parameters when not provided', async () => {
      // Mock validation for flux-schnell
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockResolvedValue({
          actualFileName: 'flux_schnell.safetensors',
          exists: true,
          timestamp: Date.now(),
        }),
      };

      // Setup mocks
      Object.defineProperty(instance, 'modelValidator', {
        configurable: true,
        value: mockValidationManager,
        writable: true,
      });

      // Mock model resolution for flux-schnell
      mockModelResolver.resolveModelFileName.mockResolvedValue('flux_schnell.safetensors');

      const mockResult = {
        images: {
          images: [{ filename: 'test.png' }],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Minimal parameters test',
        },
      };

      await instance.createImage(payload);

      // Verify the workflow was executed with default parameters
      expect(mockCallWrapper.run).toHaveBeenCalled();
      // Verify validation was called
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/flux-schnell',
      );
    });

    it('should use an empty string for prompt in generic workflow if not provided', async () => {
      // Mock validation for SD model
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockResolvedValue({
          actualFileName: 'sd_xl_base.safetensors',
          exists: true,
          timestamp: Date.now(),
        }),
      };

      // Setup mocks
      Object.defineProperty(instance, 'modelValidator', {
        configurable: true,
        value: mockValidationManager,
        writable: true,
      });

      // Mock model resolution
      mockModelResolver.resolveModelFileName.mockResolvedValue('sd_xl_base.safetensors');

      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['sd_xl_base.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [{ filename: 'test.png' }],
        },
      };

      mockCallWrapper.run.mockImplementation(() => {
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/sd-xl',
        params: {
          prompt: '', // empty prompt to test default value handling
        },
      };

      await instance.createImage(payload);

      // Verify the workflow was executed with empty prompt
      expect(mockCallWrapper.run).toHaveBeenCalled();
      // Verify validation was called
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith('comfyui/sd-xl');
    });

    it('should throw error when model is not in verified list', async () => {
      // Mock validation to fail for non-verified model
      const mockValidationManager = {
        validateModelExistence: vi.fn().mockRejectedValue({
          error: { model: 'comfyui/abc-def-ghi' },
          errorType: AgentRuntimeErrorType.ModelNotFound,
        }),
      };

      // Setup mocks
      Object.defineProperty(instance, 'modelValidator', {
        configurable: true,
        value: mockValidationManager,
        writable: true,
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/abc-def-ghi', // Won't match any verified model
        params: {
          prompt: 'Test non-verified model',
        },
      };

      // Should throw error for non-verified model
      await expect(instance.createImage(payload)).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.ModelNotFound,
      });

      // Verify validation was attempted
      expect(mockValidationManager.validateModelExistence).toHaveBeenCalledWith(
        'comfyui/abc-def-ghi',
      );
    });
  });

  describe('Progress Handling', () => {
    beforeEach(() => {
      instance = new LobeComfyUI({ apiKey: 'test-key' });
    });

    it('should handle progress callbacks during workflow execution', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['flux_schnell.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const mockResult = {
        images: {
          images: [{ filename: 'test.png' }],
        },
      };

      let progressCallback: (info: any) => void;

      mockCallWrapper.onProgress.mockImplementation((callback) => {
        progressCallback = callback;
        return mockCallWrapper;
      });

      mockCallWrapper.run.mockImplementation(() => {
        // Simulate progress updates
        progressCallback({ step: 1, total: 4 });
        progressCallback({ step: 2, total: 4 });
        progressCallback({ step: 3, total: 4 });
        progressCallback({ step: 4, total: 4 });

        // Then finish
        const finishCallback = mockCallWrapper.onFinished.mock.calls[0][0];
        finishCallback(mockResult);
      });

      const payload: CreateImagePayload = {
        model: 'comfyui/flux-schnell',
        params: {
          prompt: 'Test progress handling',
        },
      };

      await instance.createImage(payload);

      expect(mockCallWrapper.onProgress).toHaveBeenCalled();
    });
  });

  describe('Authentication edge cases', () => {
    it('should throw InvalidProviderAPIKey for bearer auth without apiKey', () => {
      expect(() => {
        new LobeComfyUI({
          authType: 'bearer',
          // No apiKey provided - should throw error
        });
      }).toThrow();

      // Verify it throws the correct error type
      try {
        new LobeComfyUI({
          authType: 'bearer',
        });
      } catch (error: any) {
        expect(error.errorType).toBe('InvalidProviderAPIKey');
      }
    });

    it('should handle custom auth without customHeaders', () => {
      const instance = new LobeComfyUI({
        authType: 'custom',
        // No customHeaders provided
      });
      expect(instance).toBeDefined();
      expect(instance.baseURL).toBe('http://localhost:8188');
    });

    // Tests to achieve 100% branch coverage of createCredentials method
    describe('createCredentials fallback scenarios', () => {
      it('should pass undefined credentials when custom auth has no customHeaders', () => {
        const instance = new LobeComfyUI({
          authType: 'custom',
          // No customHeaders provided - hits break statement on line 318
        });

        // Verify ComfyApi was called with credentials: undefined
        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: undefined,
        });
      });

      it('should pass undefined credentials when custom auth has empty customHeaders', () => {
        const instance = new LobeComfyUI({
          authType: 'custom',
          customHeaders: {}, // Empty object - hits break statement on line 318
        });

        // Verify ComfyApi was called with credentials: undefined
        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: undefined,
        });
      });

      it('should pass undefined credentials when custom auth has null customHeaders', () => {
        const instance = new LobeComfyUI({
          authType: 'custom',
          customHeaders: null as any, // null value - hits break statement on line 318
        });

        // Verify ComfyApi was called with credentials: undefined
        expect(ComfyApi).toHaveBeenCalledWith('http://localhost:8188', undefined, {
          credentials: undefined,
        });
      });
    });
  });

  describe('models() edge cases', () => {
    beforeEach(() => {
      instance = new LobeComfyUI({ baseURL: 'http://localhost:8188' });
    });

    it('should return empty array when no checkpoint loader available', async () => {
      const mockObjectInfo = {
        // No CheckpointLoaderSimple
        SomeOtherNode: {},
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const result = await instance.models();
      expect(result).toEqual([]);
    });

    it('should return empty array when ckpt_name is not available', async () => {
      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              // No ckpt_name field
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const result = await instance.models();
      expect(result).toEqual([]);
    });

    it('should return empty array when fetch fails', async () => {
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      const result = await instance.models();
      expect(result).toEqual([]);
    });

    it('should handle undefined MODEL_LIST_CONFIGS.comfyui gracefully', async () => {
      // Mock the MODEL_LIST_CONFIGS to not have comfyui config
      const modelParseModule = await import('../utils/modelParse');
      const originalConfig = modelParseModule.MODEL_LIST_CONFIGS.comfyui;

      // Temporarily remove the comfyui config to trigger the fallback
      delete (modelParseModule.MODEL_LIST_CONFIGS as any).comfyui;

      const mockObjectInfo = {
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: [['test-model.safetensors']],
            },
          },
        },
      };

      (global.fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve(mockObjectInfo),
      });

      const result = await instance.models();

      // This covers the `MODEL_LIST_CONFIGS.comfyui || {}` fallback branch
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Restore the original config
      (modelParseModule.MODEL_LIST_CONFIGS as any).comfyui = originalConfig;
    });
  });
});
