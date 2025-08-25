import { describe, expect, it } from 'vitest';

import { AgentRuntimeErrorType } from '../error';
import { cleanComfyUIErrorMessage, parseComfyUIErrorMessage } from './comfyuiErrorParser';

describe('ComfyUIErrorParser', () => {
  describe('cleanComfyUIErrorMessage', () => {
    it('should remove leading asterisks and spaces', () => {
      const message = '* Error message with leading asterisk';
      const result = cleanComfyUIErrorMessage(message);
      expect(result).toBe('Error message with leading asterisk');
    });

    it('should convert escaped newlines and replace multiple newlines with spaces', () => {
      const message = 'Error\\nwith\\nnewlines\\n\\nand spaces';
      const result = cleanComfyUIErrorMessage(message);
      expect(result).toBe('Error with newlines and spaces');
    });

    it('should trim whitespace', () => {
      const message = '  Error message with spaces  ';
      const result = cleanComfyUIErrorMessage(message);
      expect(result).toBe('Error message with spaces');
    });
  });

  describe('parseComfyUIErrorMessage', () => {
    describe('network errors', () => {
      it('should identify fetch failed errors', () => {
        const error = new Error('fetch failed');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('fetch failed');
      });

      it('should identify ECONNREFUSED errors', () => {
        const error = { message: 'connect ECONNREFUSED 127.0.0.1:8188', code: 'ECONNREFUSED' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('connect ECONNREFUSED 127.0.0.1:8188');
      });

      it('should identify ENOTFOUND errors', () => {
        const error = { message: 'getaddrinfo ENOTFOUND localhost', code: 'ENOTFOUND' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.code).toBe('ENOTFOUND');
      });

      it('should identify timeout errors', () => {
        const error = new Error('Connection timeout after 5000ms');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('Connection timeout after 5000ms');
      });

      it('should identify WebSocket errors', () => {
        const error = new Error('WebSocket connection failed');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket connection failed');
      });
    });

    describe('HTTP status errors', () => {
      it('should identify 401 authentication errors', () => {
        const error = { message: 'Unauthorized', status: 401 };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
        expect(result.error.status).toBe(401);
      });

      it('should identify 403 permission errors', () => {
        const error = { message: 'Forbidden', status: 403 };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.PermissionDenied);
        expect(result.error.status).toBe(403);
      });

      it('should identify 500+ server errors', () => {
        const error = { message: 'Internal Server Error', status: 500 };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.status).toBe(500);
      });

      it('should identify 503 service unavailable errors', () => {
        const error = { message: 'Service Unavailable', status: 503 };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.status).toBe(503);
      });
    });

    describe('model errors', () => {
      it('should identify model not found errors', () => {
        const error = new Error('Model not found: flux-dev.safetensors');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ModelNotFound);
        expect(result.error.message).toBe('Model not found: flux-dev.safetensors');
      });

      it('should identify checkpoint errors', () => {
        const error = new Error('Checkpoint not found in models directory');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ModelNotFound);
        expect(result.error.message).toBe('Checkpoint not found in models directory');
      });

      it('should identify safetensors errors', () => {
        const error = new Error('Failed to load safetensors file');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ModelNotFound);
        expect(result.error.message).toBe('Failed to load safetensors file');
      });

      it('should identify ckpt_name errors', () => {
        const error = new Error('Invalid ckpt_name parameter');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ModelNotFound);
        expect(result.error.message).toBe('Invalid ckpt_name parameter');
      });
    });

    describe('workflow errors', () => {
      it('should identify node execution errors', () => {
        const error = new Error('Node execution failed: KSampler');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Node execution failed: KSampler');
      });

      it('should identify workflow validation errors', () => {
        const error = new Error('Workflow validation failed: invalid input');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Workflow validation failed: invalid input');
      });

      it('should identify prompt execution errors', () => {
        const error = new Error('Prompt execution error in queue');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Prompt execution error in queue');
      });

      it('should identify missing required parameters', () => {
        const error = new Error('Missing required parameter: width');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Missing required parameter: width');
      });
    });

    describe('structured error objects', () => {
      it('should handle already structured ComfyUI errors', () => {
        const error = {
          message: 'Structured error message',
          code: 'WORKFLOW_ERROR',
          status: 400,
          details: { nodeId: '5', nodeName: 'KSampler' },
          type: 'workflow_error',
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Structured error message');
        expect(result.error.code).toBe('WORKFLOW_ERROR');
        expect(result.error.status).toBe(400);
        expect(result.error.details).toEqual({ nodeId: '5', nodeName: 'KSampler' });
        expect(result.error.type).toBe('workflow_error');
      });

      it('should handle nested error objects', () => {
        const error = {
          error: {
            message: 'Nested error message',
            code: 'NESTED_ERROR',
            status: 500,
          },
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('Nested error message');
        expect(result.error.code).toBe('NESTED_ERROR');
        expect(result.error.status).toBe(500);
      });

      it('should handle Error instances with additional properties', () => {
        const error = new Error('Error instance message');
        (error as any).code = 'CUSTOM_CODE';
        (error as any).status = 400;

        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Error instance message');
        expect(result.error.code).toBe('CUSTOM_CODE');
        expect(result.error.status).toBe(400);
        expect(result.error.type).toBe('Error');
      });
    });

    describe('string errors', () => {
      it('should handle string errors', () => {
        const error = 'Simple string error message';
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Simple string error message');
      });

      it('should handle string errors with formatting', () => {
        const error = '* String error\\nwith formatting\\n\\nand newlines  ';
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('String error with formatting and newlines');
      });
    });

    describe('fallback behavior', () => {
      it('should handle unknown error types', () => {
        const error = { unknownProperty: 'unknown value' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('[object Object]');
      });

      it('should handle null and undefined', () => {
        const nullResult = parseComfyUIErrorMessage(null);
        expect(nullResult.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(nullResult.error.message).toBe('null');

        const undefinedResult = parseComfyUIErrorMessage(undefined);
        expect(undefinedResult.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(undefinedResult.error.message).toBe('undefined');
      });

      it('should handle numbers and other primitives', () => {
        const numberResult = parseComfyUIErrorMessage(500);
        expect(numberResult.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(numberResult.error.message).toBe('500');

        const booleanResult = parseComfyUIErrorMessage(true);
        expect(booleanResult.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(booleanResult.error.message).toBe('true');
      });
    });
  });
});
