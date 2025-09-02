import { describe, expect, it } from 'vitest';

import { AgentRuntimeErrorType } from '../types/error';
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

      it('should identify 404 not found errors', () => {
        const error = { message: 'Not Found', status: 404 };
        const result = parseComfyUIErrorMessage(error);

        // 404 triggers InvalidProviderAPIKey to show ComfyUIAuth for baseURL errors
        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
        expect(result.error.status).toBe(404);
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

      // Tests for HTTP status in message without status field
      it('should identify HTTP 401 in message without status field', () => {
        const error = { message: 'Request failed with HTTP 401 Unauthorized' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
        expect(result.error.message).toBe('Request failed with HTTP 401 Unauthorized');
      });

      it('should identify HTTP 403 in message without status field', () => {
        const error = { message: 'Error: HTTP 403 Forbidden - Access denied' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.PermissionDenied);
        expect(result.error.message).toBe('Error: HTTP 403 Forbidden - Access denied');
      });

      it('should identify HTTP 404 in message without status field', () => {
        const error = { message: 'HTTP 404 Not Found - Resource missing' };
        const result = parseComfyUIErrorMessage(error);

        // 404 triggers InvalidProviderAPIKey to show ComfyUIAuth for baseURL errors
        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
        expect(result.error.message).toBe('HTTP 404 Not Found - Resource missing');
      });

      it('should identify plain 401 in message without status field', () => {
        const error = { message: 'Error code 401: Authentication required' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
        expect(result.error.message).toBe('Error code 401: Authentication required');
      });

      it('should identify plain 403 in message without status field', () => {
        const error = { message: 'Failed with 403: Permission denied' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.PermissionDenied);
        expect(result.error.message).toBe('Failed with 403: Permission denied');
      });

      it('should identify plain 404 in message without status field', () => {
        const error = { message: 'Got 404 response from server' };
        const result = parseComfyUIErrorMessage(error);

        // 404 triggers InvalidProviderAPIKey to show ComfyUIAuth for baseURL errors
        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
        expect(result.error.message).toBe('Got 404 response from server');
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

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
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

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.message).toBe('Prompt execution error in queue');
      });

      it('should identify missing required parameters', () => {
        const error = new Error('Missing required parameter: width');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.message).toBe('Missing required parameter: width');
      });
    });

    describe('SDK custom errors', () => {
      it('should identify CallWrapperError', () => {
        const error = { name: 'CallWrapperError', message: 'Call wrapper failed' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Call wrapper failed');
      });

      it('should identify ExecutionInterruptedError', () => {
        const error = { name: 'ExecutionInterruptedError', message: 'Execution was interrupted' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Execution was interrupted');
      });

      it('should identify MissingNodeError', () => {
        const error = { name: 'MissingNodeError', message: 'Missing node in workflow' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Missing node in workflow');
      });

      it('should identify InvalidModelError', () => {
        const error = { name: 'InvalidModelError', message: 'Model configuration is invalid' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Model configuration is invalid');
      });

      it('should identify WorkflowValidationError', () => {
        const error = { name: 'WorkflowValidationError', message: 'Workflow validation failed' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Workflow validation failed');
      });

      it('should identify ComfyUIConnectionError', () => {
        const error = { name: 'ComfyUIConnectionError', message: 'Connection to ComfyUI failed' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Connection to ComfyUI failed');
      });

      it('should identify ComfyUITimeoutError', () => {
        const error = { name: 'ComfyUITimeoutError', message: 'ComfyUI operation timed out' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('ComfyUI operation timed out');
      });

      it('should identify ComfyUIRuntimeError', () => {
        const error = { name: 'ComfyUIRuntimeError', message: 'Runtime error occurred' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Runtime error occurred');
      });

      it('should identify ComfyUIConfigError', () => {
        const error = { name: 'ComfyUIConfigError', message: 'Configuration error detected' };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Configuration error detected');
      });

      it('should identify SDK errors by message patterns', () => {
        const testCases = [
          {
            message: 'SDK error: operation failed',
            expected: AgentRuntimeErrorType.ComfyUIBizError,
          },
          {
            message: 'Call wrapper timeout occurred',
            expected: AgentRuntimeErrorType.ComfyUIBizError,
          },
          {
            message: 'Execution interrupted by user',
            expected: AgentRuntimeErrorType.ComfyUIBizError,
          },
          {
            message: 'Missing node type in workflow',
            expected: AgentRuntimeErrorType.ComfyUIBizError,
          },
          {
            message: 'Invalid model configuration detected',
            expected: AgentRuntimeErrorType.ComfyUIBizError,
          },
          {
            message: 'SDK timeout after 30 seconds',
            expected: AgentRuntimeErrorType.ComfyUIBizError,
          },
          {
            message: 'SDK configuration error in settings',
            expected: AgentRuntimeErrorType.ComfyUIBizError,
          },
        ];

        testCases.forEach(({ message, expected }) => {
          const error = { message };
          const result = parseComfyUIErrorMessage(error);
          expect(result.errorType).toBe(expected);
          expect(result.error.message).toBe(message);
        });
      });

      it('should identify errors with SDK-specific names from actual SDK', () => {
        // Test errors that are NOT in the SDK list should fall back to other categorization
        class WentMissingError extends Error {
          constructor(message: string) {
            super(message);
            this.name = 'WentMissingError';
          }
        }

        class FailedCacheError extends Error {
          constructor(message: string) {
            super(message);
            this.name = 'FailedCacheError';
          }
        }

        const wentMissingError = new WentMissingError('Resource went missing');
        Object.defineProperty(wentMissingError, 'name', { value: 'WentMissingError' });
        const wentMissingResult = parseComfyUIErrorMessage(wentMissingError);
        // Should fallback to workflow error due to generic error handling
        expect(wentMissingResult.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);

        const failedCacheError = new FailedCacheError('Cache operation failed');
        Object.defineProperty(failedCacheError, 'name', { value: 'FailedCacheError' });
        const failedCacheResult = parseComfyUIErrorMessage(failedCacheError);
        // Should fallback to default bizError
        expect(failedCacheResult.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
      });
    });

    describe('WebSocket lifecycle errors', () => {
      it('should identify WebSocket initialization failed', () => {
        const error = new Error('WebSocket initialization failed');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket initialization failed');
      });

      it('should identify maximum reconnection attempts exceeded', () => {
        const error = new Error('Maximum reconnection attempts exceeded');
        const result = parseComfyUIErrorMessage(error);

        // This specific error isn't handled, falls through to default ComfyUIBizError
        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Maximum reconnection attempts exceeded');
      });

      it('should identify WebSocket is not open or available', () => {
        const error = new Error('WebSocket is not open or available');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket is not open or available');
      });

      it('should identify Socket closed reconnecting pattern', () => {
        // The WebSocket detection looks for "websocket" in the message, but "Socket closed" does not contain it
        // So this should fall back to general error handling, not WebSocket lifecycle error
        const error = new Error('Socket closed. Reconnecting in 5 seconds...');
        const result = parseComfyUIErrorMessage(error);

        // This would be categorized as a general business error since it doesn't match WebSocket patterns
        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('Socket closed. Reconnecting in 5 seconds...');
      });

      it('should identify Connection lost to ComfyUI server', () => {
        const error = new Error('Connection lost to ComfyUI server');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('Connection lost to ComfyUI server');
      });

      it('should identify WebSocket connection interrupted', () => {
        const error = new Error('WebSocket connection interrupted');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket connection interrupted');
      });

      it('should identify Failed to establish WebSocket connection', () => {
        const error = new Error('Failed to establish WebSocket connection');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('Failed to establish WebSocket connection');
      });

      it('should identify WebSocket connection lost', () => {
        const error = new Error('WebSocket connection lost');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket connection lost');
      });

      it('should identify WebSocket handshake failed', () => {
        const error = new Error('WebSocket handshake failed');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket handshake failed');
      });

      it('should identify WebSocket timeout', () => {
        const error = new Error('WebSocket timeout after 30 seconds');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket timeout after 30 seconds');
      });

      it('should identify WebSocket disconnected', () => {
        const error = new Error('WebSocket disconnected unexpectedly');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket disconnected unexpectedly');
      });

      it('should identify WebSocket closed unexpectedly', () => {
        const error = new Error('WebSocket closed unexpectedly');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket closed unexpectedly');
      });

      it('should identify WebSocket errors by code', () => {
        const testCases = [
          {
            code: 'WS_CONNECTION_FAILED',
            message: 'WebSocket connection failed',
            expected: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
          },
          {
            code: 'WS_TIMEOUT',
            message: 'WebSocket timeout occurred',
            expected: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
          },
          {
            code: 'WS_HANDSHAKE_FAILED',
            message: 'WebSocket handshake failed',
            expected: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
          },
        ];

        testCases.forEach(({ code, message, expected }) => {
          const error = { message, code };
          const result = parseComfyUIErrorMessage(error);
          expect(result.errorType).toBe(expected);
          expect(result.error.message).toBe(message);
          expect(result.error.code).toBe(code);
        });
      });

      it('should identify ws connection patterns', () => {
        const error = new Error('ws connection to server failed');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('ws connection to server failed');
      });

      it('should identify WebSocket error patterns', () => {
        const error = new Error('WebSocket error: Connection refused');
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
        expect(result.error.message).toBe('WebSocket error: Connection refused');
      });
    });

    describe('enhanced workflow errors', () => {
      it('should identify workflow errors by node_id field', () => {
        const error = {
          message: 'Node execution failed',
          node_id: '5',
          details: { nodeType: 'KSampler' },
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.message).toBe('Node execution failed');
        expect(result.error.details?.node_id).toBe('5');
      });

      it('should identify workflow errors by nodeId field', () => {
        const error = {
          message: 'Node processing failed',
          nodeId: '3',
          nodeType: 'TextEncode',
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.message).toBe('Node processing failed');
        expect(result.error.details?.node_id).toBe('3');
        expect(result.error.details?.node_type).toBe('TextEncode');
      });

      it('should identify workflow errors by node_type field', () => {
        const error = {
          message: 'Invalid node type',
          node_type: 'UnknownNode',
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.message).toBe('Invalid node type');
        expect(result.error.details?.node_type).toBe('UnknownNode');
      });

      it('should identify workflow errors by nodeType field', () => {
        const error = {
          message: 'Node type not supported',
          nodeType: 'CustomNode',
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.message).toBe('Node type not supported');
        expect(result.error.details?.node_type).toBe('CustomNode');
      });

      it('should extract exception_message from root level', () => {
        const error = {
          message: 'General error occurred',
          exception_message: 'Detailed exception information',
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.error.message).toBe('Detailed exception information');
      });

      it('should extract exception_message from nested error', () => {
        const error = {
          message: 'General error occurred',
          error: {
            exception_message: 'Nested exception details',
          },
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.error.message).toBe('Nested exception details');
      });

      it('should handle deeply nested error.error.error', () => {
        const error = {
          message: 'Top level message',
          error: {
            error: 'Deeply nested error message',
          },
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.error.message).toBe('Deeply nested error message');
      });

      it('should handle combined node fields and exception_message', () => {
        const error = {
          message: 'General error',
          node_id: '7',
          nodeType: 'VAEDecode',
          exception_message: 'VAE decoding failed: invalid tensor shape',
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.message).toBe('VAE decoding failed: invalid tensor shape');
        expect(result.error.details?.node_id).toBe('7');
        expect(result.error.details?.node_type).toBe('VAEDecode');
      });

      it('should preserve existing details when adding node fields', () => {
        const error = {
          message: 'Error in workflow',
          node_id: '2',
          node_type: 'CheckpointLoaderSimple',
          response: {
            data: {
              existingField: 'should be preserved',
              originalTimestamp: '2023-01-01', // Rename to avoid conflict
            },
          },
        };
        const result = parseComfyUIErrorMessage(error);

        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
        expect(result.error.details?.existingField).toBe('should be preserved');
        expect(result.error.details?.originalTimestamp).toBe('2023-01-01');
        // Node fields are added to details
        expect(result.error.details?.node_id).toBe('2');
        expect(result.error.details?.node_type).toBe('CheckpointLoaderSimple');
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

        // Status code takes priority - 400 should return InvalidProviderAPIKey
        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
        expect(result.error.message).toBe('Structured error message');
        expect(result.error.code).toBe('WORKFLOW_ERROR');
        expect(result.error.status).toBe(400);
        // Details are preserved
        expect(result.error.details).toMatchObject({
          nodeId: '5',
          nodeName: 'KSampler',
        });
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

        // Status code takes priority - 400 should return InvalidProviderAPIKey
        expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
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

    describe('edge cases for status extraction', () => {
      it('should extract status from error.error.status', () => {
        const error = {
          message: 'Error occurred',
          error: {
            status: 503,
          },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.status).toBe(503);
        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIServiceUnavailable);
      });

      it('should extract status from error.error.statusCode', () => {
        const error = {
          message: 'Error occurred',
          error: {
            statusCode: 429,
          },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.status).toBe(429);
      });

      it('should extract code from error.error.code', () => {
        const error = {
          message: 'Error occurred',
          error: {
            code: 'RATE_LIMIT',
          },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.code).toBe('RATE_LIMIT');
      });

      it('should handle error without code property', () => {
        const error = {
          message: 'Error occurred',
          response: {
            status: 400,
          },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.code).toBeUndefined();
      });
    });

    describe('deep object property access branches - coverage improvement', () => {
      it('should handle error with constructor but no name property', () => {
        const error = Object.create(null);
        error.constructor = {}; // constructor exists but has no name
        error.message = 'SDK error: test';
        const result = parseComfyUIErrorMessage(error);
        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIBizError);
        expect(result.error.message).toBe('SDK error: test');
      });

      it('should extract message from error.data.message', () => {
        const error = {
          data: { message: 'Data layer message' },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.message).toBe('Data layer message');
      });

      it('should extract message from error.body.message', () => {
        const error = {
          body: { message: 'Body layer message' },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.message).toBe('Body layer message');
      });

      it('should extract message from error.response.text', () => {
        const error = {
          response: { text: 'Raw response text error' },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.message).toBe('Raw response text error');
      });

      it('should extract message from error.response.body', () => {
        const error = {
          response: { body: 'Raw response body error' },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.message).toBe('Raw response body error');
      });

      it('should extract message from error.statusText', () => {
        const error = {
          statusText: 'Internal Server Error',
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.message).toBe('Internal Server Error');
      });

      it('should handle error.response.data.message fallback', () => {
        // Test that error.response.data.message is used when no higher priority message exists
        const error = {
          response: {
            data: {
              message: 'Response data message only',
            },
          },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.message).toBe('Response data message only');
        // Enhanced feature adds timestamp while preserving original details
        expect(result.error.details).toMatchObject({
          message: 'Response data message only',
        });
      });

      it('should extract message from error.response.data.error.message - deepest path', () => {
        // This covers line 230: error.response?.data?.error?.message
        const error = {
          response: {
            data: {
              error: {
                message: 'Deeply nested response error message',
              },
            },
          },
        };
        const result = parseComfyUIErrorMessage(error);
        expect(result.error.message).toBe('Deeply nested response error message');
        // Enhanced feature adds timestamp while preserving original details
        expect(result.error.details).toMatchObject({
          error: {
            message: 'Deeply nested response error message',
          },
        });
      });

      it('should handle generic object with node_id and node_type in other object branch', () => {
        // This specifically tests lines 254-260 in the generic object branch
        const error = {
          node_id: 'node_123',
          node_type: 'LoadImageNode',
          message: 'Node execution failed',
          // Ensure we're not in structured error branch
          unknownField: 'force generic object path',
        };
        const result = parseComfyUIErrorMessage(error);
        // Enhanced feature adds timestamp and nodeInfo
        expect(result.error.details).toMatchObject({
          node_id: 'node_123',
          node_type: 'LoadImageNode',
        });
        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
      });

      it('should handle generic object with nodeId and nodeType fields', () => {
        // Test alternative field names in generic object branch
        const error = {
          nodeId: 'node_456',
          nodeType: 'CLIPTextEncodeNode',
          message: 'Text encoding failed',
          randomField: 'ensure generic path',
        };
        const result = parseComfyUIErrorMessage(error);
        // Enhanced feature adds timestamp
        expect(result.error.details).toMatchObject({
          node_id: 'node_456',
          node_type: 'CLIPTextEncodeNode',
        });
        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
      });

      it('should merge node fields with existing details from response.data', () => {
        const error = {
          response: {
            data: {
              existingData: 'preserved',
              workflow_id: 'wf_123',
            },
          },
          node_id: 'node_789',
          node_type: 'SamplerNode',
          message: 'Sampling failed',
        };
        const result = parseComfyUIErrorMessage(error);
        // Enhanced feature adds timestamp (no nodeInfo from "Sampling failed")
        expect(result.error.details).toMatchObject({
          existingData: 'preserved',
          workflow_id: 'wf_123',
          node_id: 'node_789',
          node_type: 'SamplerNode',
        });
      });

      it('should handle node fields when details is from error.error', () => {
        const error = {
          error: {
            someError: 'data',
          },
          nodeId: 'mixed_node',
          message: 'Mixed error scenario',
        };
        const result = parseComfyUIErrorMessage(error);
        // Node fields are added to details
        expect(result.error.details).toMatchObject({
          node_id: 'mixed_node',
          node_type: undefined,
        });
      });

      it('should handle only node_type without node_id', () => {
        const error = {
          node_type: 'VAEDecode',
          message: 'VAE decoding failed',
          extraField: 'test',
        };
        const result = parseComfyUIErrorMessage(error);
        // Enhanced feature adds timestamp
        expect(result.error.details).toMatchObject({
          node_id: undefined,
          node_type: 'VAEDecode',
        });
        expect(result.errorType).toBe(AgentRuntimeErrorType.ComfyUIWorkflowError);
      });
    });
  });
});
