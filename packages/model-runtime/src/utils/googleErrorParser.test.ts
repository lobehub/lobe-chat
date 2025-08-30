import { describe, expect, it } from 'vitest';

import { AgentRuntimeErrorType } from '../types/error';
import {
  cleanErrorMessage,
  extractStatusCodeFromError,
  parseGoogleErrorMessage,
} from './googleErrorParser';

describe('googleErrorParser', () => {
  describe('cleanErrorMessage', () => {
    it('should remove leading asterisk and spaces', () => {
      const input = '* API key not valid. Please check your credentials.';
      const expected = 'API key not valid. Please check your credentials.';
      expect(cleanErrorMessage(input)).toBe(expected);
    });

    it('should convert escaped newlines to actual newlines', () => {
      const input = 'Error occurred\\nPlease try again';
      const expected = 'Error occurred Please try again';
      expect(cleanErrorMessage(input)).toBe(expected);
    });

    it('should replace multiple newlines with single space', () => {
      const input = 'Line 1\n\n\nLine 2\nLine 3';
      const expected = 'Line 1 Line 2 Line 3';
      expect(cleanErrorMessage(input)).toBe(expected);
    });

    it('should trim whitespace', () => {
      const input = '  \t  Error message  \t  ';
      const expected = 'Error message';
      expect(cleanErrorMessage(input)).toBe(expected);
    });

    it('should handle combined formatting issues', () => {
      const input =
        '* API key not valid.\\nPlease check your credentials.\\n\\nContact support if needed.  ';
      const expected =
        'API key not valid. Please check your credentials. Contact support if needed.';
      expect(cleanErrorMessage(input)).toBe(expected);
    });
  });

  describe('extractStatusCodeFromError', () => {
    it('should extract status code and message correctly', () => {
      const input = 'Connection failed [503 Service Unavailable] Please try again later';
      const result = extractStatusCodeFromError(input);

      expect(result.errorDetails).toEqual({
        message: 'Please try again later',
        statusCode: 503,
        statusCodeText: '[503 Service Unavailable]',
      });
      expect(result.prefix).toBe('Connection failed');
    });

    it('should handle different status codes', () => {
      const input = 'Request failed [401 Unauthorized] Invalid credentials';
      const result = extractStatusCodeFromError(input);

      expect(result.errorDetails).toEqual({
        message: 'Invalid credentials',
        statusCode: 401,
        statusCodeText: '[401 Unauthorized]',
      });
      expect(result.prefix).toBe('Request failed');
    });

    it('should return null for messages without status codes', () => {
      const input = 'Simple error message without status code';
      const result = extractStatusCodeFromError(input);

      expect(result.errorDetails).toBeNull();
      expect(result.prefix).toBe('Simple error message without status code');
    });

    it('should handle empty message after status code', () => {
      const input = 'Error [404 Not Found]';
      const result = extractStatusCodeFromError(input);

      expect(result.errorDetails).toEqual({
        message: '',
        statusCode: 404,
        statusCodeText: '[404 Not Found]',
      });
      expect(result.prefix).toBe('Error');
    });
  });

  describe('parseGoogleErrorMessage', () => {
    it('should handle location not supported error', () => {
      const input = 'This location is not supported for Google AI services';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.LocationNotSupportError);
      expect(result.error.message).toBe(input);
    });

    it('should handle status JSON format', () => {
      const input =
        'got status: UNAVAILABLE. {"error":{"code":503,"message":"Service temporarily unavailable","status":"UNAVAILABLE"}}';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error).toEqual({
        code: 503,
        message: 'Service temporarily unavailable',
        status: 'UNAVAILABLE',
      });
    });

    it('should handle direct JSON parsing', () => {
      const input =
        '{"error":{"code":400,"message":"* API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
      expect(result.error).toEqual({
        code: 400,
        message: 'API key not valid. Please pass a valid API key.',
        status: 'INVALID_ARGUMENT',
      });
    });

    it('should handle quota limit error', () => {
      const input =
        '{"error":{"code":429,"message":"Quota limit reached","status":"RESOURCE_EXHAUSTED"}}';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.QuotaLimitReached);
      expect(result.error).toEqual({
        code: 429,
        message: 'Quota limit reached',
        status: 'RESOURCE_EXHAUSTED',
      });
    });

    it('should handle nested JSON format', () => {
      const input =
        '{"error":{"message":"{\\"error\\":{\\"code\\":400,\\"message\\":\\"Invalid request\\"}}"}}';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error).toEqual({
        code: 400,
        message: 'Invalid request',
        status: '',
      });
    });

    it('should handle array format with API_KEY_INVALID', () => {
      const input =
        'Request failed [{"@type": "type.googleapis.com/google.rpc.ErrorInfo", "reason": "API_KEY_INVALID", "domain": "googleapis.com"}]';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
    });

    it('should handle array format with other errors', () => {
      const input =
        'Request failed [{"@type": "type.googleapis.com/google.rpc.ErrorInfo", "reason": "QUOTA_EXCEEDED", "domain": "googleapis.com"}]';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error).toEqual([
        {
          '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
          'reason': 'QUOTA_EXCEEDED',
          'domain': 'googleapis.com',
        },
      ]);
    });

    it('should handle status code extraction fallback', () => {
      const input = 'Connection failed [503 Service Unavailable] Please try again later';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error).toEqual({
        message: 'Please try again later',
        statusCode: 503,
        statusCodeText: '[503 Service Unavailable]',
      });
    });

    it('should handle complex nested JSON with message cleaning', () => {
      const input =
        '{"error":{"code":400,"message":"* Request contains invalid parameters\\nPlease check the documentation\\n\\nContact support for help"}}';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error.message).toBe(
        'Request contains invalid parameters Please check the documentation Contact support for help',
      );
    });

    it('should return default error for unparseable messages', () => {
      const input = 'Some random error message that cannot be parsed';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error.message).toBe(input);
    });

    it('should handle malformed JSON gracefully', () => {
      const input = '{"error":{"code":400,"message":"Invalid JSON{incomplete';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error.message).toBe(input);
    });

    it('should handle empty error object in JSON', () => {
      const input = '{"error":{}}';
      const result = parseGoogleErrorMessage(input);

      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error).toEqual({
        code: null,
        message: input,
        status: '',
      });
    });

    it('should handle recursion depth limit', () => {
      // Create a deeply nested JSON that exceeds the recursion limit
      let deeplyNested = '{"error":{"code":400,"message":"Deep error"}}';
      for (let i = 0; i < 6; i++) {
        deeplyNested = `{"error":{"message":"${deeplyNested.replaceAll('"', '\\"')}"}}`;
      }

      const result = parseGoogleErrorMessage(deeplyNested);

      // Should still return a valid result, but might not reach the deepest level
      expect(result.errorType).toBe(AgentRuntimeErrorType.ProviderBizError);
      expect(result.error).toBeDefined();
    });
  });
});
