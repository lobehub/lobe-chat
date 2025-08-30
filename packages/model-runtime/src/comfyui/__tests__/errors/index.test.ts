import { describe, expect, it } from 'vitest';

import {
  ComfyUIInternalError,
  ConfigError,
  UtilsError,
  WorkflowError,
  isComfyUIInternalError,
} from '../../errors/index';

// Helper function for testing error throwing
const throwWorkflowError = () => {
  throw new WorkflowError('test', WorkflowError.Reasons.UNSUPPORTED_MODEL);
};

describe('ComfyUI Internal Error System', () => {
  describe('ComfyUIInternalError Base Class', () => {
    // Create a concrete implementation for testing
    class TestError extends ComfyUIInternalError {
      constructor(message: string, reason: string, details?: Record<string, any>) {
        super(message, reason, details);
        this.name = 'TestError';
      }
    }

    it('should create error with message and reason', () => {
      const error = new TestError('Test error message', 'TEST_REASON');

      expect(error).toBeInstanceOf(ComfyUIInternalError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error message');
      expect(error.reason).toBe('TEST_REASON');
      expect(error.name).toBe('TestError');
      expect(error.details).toBeUndefined();
    });

    it('should create error with details', () => {
      const details = { code: 123, key: 'value' };
      const error = new TestError('Error with details', 'DETAILED_ERROR', details);

      expect(error.message).toBe('Error with details');
      expect(error.reason).toBe('DETAILED_ERROR');
      expect(error.details).toEqual(details);
    });

    it('should have proper stack trace', () => {
      const error = new TestError('Stack trace test', 'STACK_TEST');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TestError');
      expect(error.stack).toContain('Stack trace test');
    });
  });

  describe('ConfigError', () => {
    it('should have correct name and reason constants', () => {
      const error = new ConfigError('Config error', ConfigError.Reasons.INVALID_CONFIG);

      expect(error.name).toBe('ConfigError');
      expect(error).toBeInstanceOf(ComfyUIInternalError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should support all defined reason constants', () => {
      const reasons = [
        ConfigError.Reasons.INVALID_CONFIG,
        ConfigError.Reasons.MISSING_CONFIG,
        ConfigError.Reasons.CONFIG_PARSE_ERROR,
        ConfigError.Reasons.REGISTRY_ERROR,
      ];

      reasons.forEach((reason) => {
        const error = new ConfigError(`Error: ${reason}`, reason);
        expect(error.reason).toBe(reason);
      });
    });

    it('should include configuration details', () => {
      const error = new ConfigError(
        'Invalid model configuration',
        ConfigError.Reasons.INVALID_CONFIG,
        {
          actualFormat: '.ckpt',
          expectedFormat: '.safetensors',
          modelName: 'flux1-dev.safetensors',
        },
      );

      expect(error.details).toEqual({
        actualFormat: '.ckpt',
        expectedFormat: '.safetensors',
        modelName: 'flux1-dev.safetensors',
      });
    });

    it('should handle missing configuration scenario', () => {
      const error = new ConfigError(
        'Model configuration not found',
        ConfigError.Reasons.MISSING_CONFIG,
        { searchedModel: 'flux-unknown' },
      );

      expect(error.reason).toBe('MISSING_CONFIG');
      expect(error.details?.searchedModel).toBe('flux-unknown');
    });

    it('should handle parse error scenario', () => {
      const error = new ConfigError(
        'Failed to parse model config',
        ConfigError.Reasons.CONFIG_PARSE_ERROR,
        { column: 10, file: 'modelRegistry.ts', line: 42 },
      );

      expect(error.reason).toBe('CONFIG_PARSE_ERROR');
      expect(error.details).toMatchObject({
        column: 10,
        file: 'modelRegistry.ts',
        line: 42,
      });
    });

    it('should handle registry error scenario', () => {
      const error = new ConfigError(
        'Registry operation failed',
        ConfigError.Reasons.REGISTRY_ERROR,
        { operation: 'register', registry: 'MODEL_REGISTRY' },
      );

      expect(error.reason).toBe('REGISTRY_ERROR');
      expect(error.details?.operation).toBe('register');
      expect(error.details?.registry).toBe('MODEL_REGISTRY');
    });
  });

  describe('WorkflowError', () => {
    it('should have correct name and reason constants', () => {
      const error = new WorkflowError('Workflow error', WorkflowError.Reasons.INVALID_CONFIG);

      expect(error.name).toBe('WorkflowError');
      expect(error).toBeInstanceOf(ComfyUIInternalError);
    });

    it('should support all defined reason constants', () => {
      const reasons = [
        WorkflowError.Reasons.INVALID_CONFIG,
        WorkflowError.Reasons.MISSING_COMPONENT,
        WorkflowError.Reasons.MISSING_ENCODER,
        WorkflowError.Reasons.UNSUPPORTED_MODEL,
        WorkflowError.Reasons.INVALID_PARAMS,
      ];

      reasons.forEach((reason) => {
        const error = new WorkflowError(`Error: ${reason}`, reason);
        expect(error.reason).toBe(reason);
      });
    });

    it('should handle missing component scenario', () => {
      const error = new WorkflowError(
        'Required workflow component not found',
        WorkflowError.Reasons.MISSING_COMPONENT,
        {
          availableComponents: ['KSampler', 'CLIPTextEncode'],
          component: 'VAEDecode',
          workflow: 'flux-dev',
        },
      );

      expect(error.reason).toBe('MISSING_COMPONENT');
      expect(error.details?.component).toBe('VAEDecode');
      expect(error.details?.workflow).toBe('flux-dev');
      expect(error.details?.availableComponents).toHaveLength(2);
    });

    it('should handle missing encoder scenario for SD3.5', () => {
      const error = new WorkflowError(
        'SD3.5 requires triple encoder',
        WorkflowError.Reasons.MISSING_ENCODER,
        {
          foundEncoders: ['CLIP-L'],
          model: 'sd3.5_large',
          requiredEncoders: ['CLIP-L', 'CLIP-G', 'T5XXL'],
        },
      );

      expect(error.reason).toBe('MISSING_ENCODER');
      expect(error.details?.requiredEncoders).toHaveLength(3);
      expect(error.details?.foundEncoders).toHaveLength(1);
    });

    it('should handle unsupported model scenario', () => {
      const error = new WorkflowError(
        'Model architecture not supported',
        WorkflowError.Reasons.UNSUPPORTED_MODEL,
        {
          architecture: 'CASCADE',
          model: 'stable-cascade',
          supportedArchitectures: ['FLUX', 'SD3'],
        },
      );

      expect(error.reason).toBe('UNSUPPORTED_MODEL');
      expect(error.details?.architecture).toBe('CASCADE');
    });

    it('should handle invalid parameters scenario', () => {
      const error = new WorkflowError(
        'Invalid workflow parameters',
        WorkflowError.Reasons.INVALID_PARAMS,
        {
          invalidParams: ['steps', 'cfg'],
          providedValues: { cfg: 50, steps: -1 },
          reason: 'Steps must be positive, CFG must be between 1 and 20',
        },
      );

      expect(error.reason).toBe('INVALID_PARAMS');
      expect(error.details?.invalidParams).toContain('steps');
      expect(error.details?.invalidParams).toContain('cfg');
    });
  });

  describe('UtilsError', () => {
    it('should have correct name and reason constants', () => {
      const error = new UtilsError('Utils error', UtilsError.Reasons.MODEL_NOT_FOUND);

      expect(error.name).toBe('UtilsError');
      expect(error).toBeInstanceOf(ComfyUIInternalError);
    });

    it('should support all defined reason constants', () => {
      const reasons = [
        UtilsError.Reasons.CONNECTION_ERROR,
        UtilsError.Reasons.DETECTION_FAILED,
        UtilsError.Reasons.INVALID_API_KEY,
        UtilsError.Reasons.INVALID_MODEL_FORMAT,
        UtilsError.Reasons.MODEL_NOT_FOUND,
        UtilsError.Reasons.NO_BUILDER_FOUND,
        UtilsError.Reasons.PERMISSION_DENIED,
        UtilsError.Reasons.ROUTING_FAILED,
        UtilsError.Reasons.SERVICE_UNAVAILABLE,
      ];

      reasons.forEach((reason) => {
        const error = new UtilsError(`Error: ${reason}`, reason);
        expect(error.reason).toBe(reason);
      });
    });

    it('should handle model not found scenario', () => {
      const error = new UtilsError(
        'Model not found on server',
        UtilsError.Reasons.MODEL_NOT_FOUND,
        {
          availableModels: ['flux1-dev.safetensors', 'flux1-schnell.safetensors'],
          modelName: 'flux-unknown.safetensors',
          searchLocation: 'ComfyUI server',
        },
      );

      expect(error.reason).toBe('MODEL_NOT_FOUND');
      expect(error.details?.modelName).toBe('flux-unknown.safetensors');
      expect(error.details?.availableModels).toHaveLength(2);
    });

    it('should handle detection failed scenario', () => {
      const error = new UtilsError(
        'Failed to detect model architecture',
        UtilsError.Reasons.DETECTION_FAILED,
        {
          filename: 'ambiguous-model.safetensors',
          reason: 'No pattern matched',
          testedPatterns: ['FLUX', 'SD3', 'SDXL'],
        },
      );

      expect(error.reason).toBe('DETECTION_FAILED');
      expect(error.details?.testedPatterns).toHaveLength(3);
    });

    it('should handle connection error scenario', () => {
      const error = new UtilsError(
        'Failed to connect to ComfyUI server',
        UtilsError.Reasons.CONNECTION_ERROR,
        {
          attempts: 3,
          error: 'ECONNREFUSED',
          url: 'http://localhost:8188',
        },
      );

      expect(error.reason).toBe('CONNECTION_ERROR');
      expect(error.details?.error).toBe('ECONNREFUSED');
      expect(error.details?.attempts).toBe(3);
    });

    it('should handle invalid API key scenario', () => {
      const error = new UtilsError('Authentication failed', UtilsError.Reasons.INVALID_API_KEY, {
        authType: 'bearer',
        message: 'Unauthorized',
        status: 401,
      });

      expect(error.reason).toBe('INVALID_API_KEY');
      expect(error.details?.status).toBe(401);
      expect(error.details?.authType).toBe('bearer');
    });

    it('should handle routing failed scenario', () => {
      const error = new UtilsError('Workflow routing failed', UtilsError.Reasons.ROUTING_FAILED, {
        availableRoutes: ['dev', 'schnell', 'sd35'],
        model: 'unknown-model',
        variant: undefined,
      });

      expect(error.reason).toBe('ROUTING_FAILED');
      expect(error.details?.variant).toBeUndefined();
      expect(error.details?.availableRoutes).toHaveLength(3);
    });
  });

  describe('isComfyUIInternalError Type Guard', () => {
    it('should identify ComfyUIInternalError instances', () => {
      const configError = new ConfigError('test', ConfigError.Reasons.INVALID_CONFIG);
      const workflowError = new WorkflowError('test', WorkflowError.Reasons.INVALID_CONFIG);
      const utilsError = new UtilsError('test', UtilsError.Reasons.MODEL_NOT_FOUND);

      expect(isComfyUIInternalError(configError)).toBe(true);
      expect(isComfyUIInternalError(workflowError)).toBe(true);
      expect(isComfyUIInternalError(utilsError)).toBe(true);
    });

    it('should reject non-ComfyUIInternalError objects', () => {
      const standardError = new Error('Standard error');
      const customError = { message: 'Not an error', reason: 'FAKE' };
      const nullValue = null;
      const undefinedValue = undefined;
      const stringValue = 'error string';

      expect(isComfyUIInternalError(standardError)).toBe(false);
      expect(isComfyUIInternalError(customError)).toBe(false);
      expect(isComfyUIInternalError(nullValue)).toBe(false);
      expect(isComfyUIInternalError(undefinedValue)).toBe(false);
      expect(isComfyUIInternalError(stringValue)).toBe(false);
    });

    it('should work with custom ComfyUIInternalError subclasses', () => {
      class CustomInternalError extends ComfyUIInternalError {
        constructor(message: string) {
          super(message, 'CUSTOM_REASON');
          this.name = 'CustomInternalError';
        }
      }

      const customError = new CustomInternalError('Custom internal error');
      expect(isComfyUIInternalError(customError)).toBe(true);
    });
  });

  describe('Error Inheritance Chain', () => {
    it('should maintain proper prototype chain', () => {
      const configError = new ConfigError('test', ConfigError.Reasons.INVALID_CONFIG);

      // Check inheritance chain
      expect(configError instanceof ConfigError).toBe(true);
      expect(configError instanceof ComfyUIInternalError).toBe(true);
      expect(configError instanceof Error).toBe(true);

      // Check properties are inherited
      expect(configError.message).toBe('test');
      expect(configError.reason).toBe('INVALID_CONFIG');
      expect(configError.name).toBe('ConfigError');
      expect(configError.stack).toBeDefined();
    });

    it('should allow catching at different levels', () => {
      // Can catch as specific error
      expect(() => {
        try {
          throwWorkflowError();
        } catch (error) {
          if (error instanceof WorkflowError) {
            throw new Error('Caught as WorkflowError');
          }
        }
      }).toThrow('Caught as WorkflowError');

      // Can catch as base internal error
      expect(() => {
        try {
          throwWorkflowError();
        } catch (error) {
          if (error instanceof ComfyUIInternalError) {
            throw new Error('Caught as ComfyUIInternalError');
          }
        }
      }).toThrow('Caught as ComfyUIInternalError');

      // Can catch as standard Error
      expect(() => {
        try {
          throwWorkflowError();
        } catch (error) {
          if (error instanceof Error) {
            throw new Error('Caught as Error');
          }
        }
      }).toThrow('Caught as Error');
    });
  });

  describe('Error Serialization', () => {
    it('should serialize to JSON with all properties', () => {
      const error = new ConfigError('Serialization test', ConfigError.Reasons.INVALID_CONFIG, {
        testData: 'value',
      });

      const serialized = JSON.stringify({
        details: error.details,
        message: error.message,
        name: error.name,
        reason: error.reason,
      });

      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe('ConfigError');
      expect(parsed.message).toBe('Serialization test');
      expect(parsed.reason).toBe('INVALID_CONFIG');
      expect(parsed.details).toEqual({ testData: 'value' });
    });
  });

  describe('Real-world Error Scenarios', () => {
    it('should handle model registry lookup failure', () => {
      const error = new ConfigError(
        'Model not found in registry: flux-unknown-variant',
        ConfigError.Reasons.MISSING_CONFIG,
        {
          availableVariants: ['dev', 'schnell', 'kontext', 'krea'],
          modelName: 'flux-unknown-variant',
          suggestion: 'Use one of the available variants',
        },
      );

      expect(error.reason).toBe('MISSING_CONFIG');
      expect(error.details?.suggestion).toBe('Use one of the available variants');
    });

    it('should handle workflow routing failure', () => {
      const error = new WorkflowError(
        'No workflow builder found for model',
        WorkflowError.Reasons.UNSUPPORTED_MODEL,
        {
          architecture: 'UNKNOWN',
          availableBuilders: ['flux-dev', 'flux-schnell', 'sd35'],
          modelId: 'experimental-model',
          variant: undefined,
        },
      );

      expect(error.reason).toBe('UNSUPPORTED_MODEL');
      expect(error.details?.variant).toBeUndefined();
      expect(error.details?.availableBuilders).toHaveLength(3);
    });

    it('should handle model detection failure', () => {
      const error = new UtilsError(
        'Unable to detect model architecture',
        UtilsError.Reasons.DETECTION_FAILED,
        {
          fallbackArchitecture: 'FLUX',
          fallbackUsed: true,
          filename: 'ambiguous-model.safetensors',
          hints: [],
        },
      );

      expect(error.reason).toBe('DETECTION_FAILED');
      expect(error.details?.fallbackUsed).toBe(true);
      expect(error.details?.fallbackArchitecture).toBe('FLUX');
    });

    it('should handle SD3.5 encoder validation failure', () => {
      const error = new WorkflowError(
        'SD3.5 workflow requires triple encoder setup',
        WorkflowError.Reasons.MISSING_ENCODER,
        {
          availableEncoders: {
            clipG: false,
            clipL: true,
            t5xxl: false,
          },
          fallbackMode: 'single-encoder',
          model: 'sd3.5_large.safetensors',
          requiredEncoders: {
            clipG: true,
            clipL: true,
            t5xxl: true,
          },
        },
      );

      expect(error.reason).toBe('MISSING_ENCODER');
      expect(error.details?.requiredEncoders.t5xxl).toBe(true);
      expect(error.details?.availableEncoders.t5xxl).toBe(false);
      expect(error.details?.fallbackMode).toBe('single-encoder');
    });
  });
});
