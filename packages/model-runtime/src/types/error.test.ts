import { describe, expect, it } from 'vitest';

import {
  AGENT_RUNTIME_ERROR_SET,
  AgentRuntimeErrorType,
  type ChatMessageError,
  type ErrorType,
  type ILobeAgentRuntimeErrorType,
  StandardErrorType,
} from './error';

describe('AgentRuntimeErrorType', () => {
  it('should have correct error type constants', () => {
    expect(AgentRuntimeErrorType.AgentRuntimeError).toBe('AgentRuntimeError');
    expect(AgentRuntimeErrorType.LocationNotSupportError).toBe('LocationNotSupportError');
    expect(AgentRuntimeErrorType.QuotaLimitReached).toBe('QuotaLimitReached');
    expect(AgentRuntimeErrorType.InsufficientQuota).toBe('InsufficientQuota');
    expect(AgentRuntimeErrorType.ModelNotFound).toBe('ModelNotFound');
    expect(AgentRuntimeErrorType.PermissionDenied).toBe('PermissionDenied');
    expect(AgentRuntimeErrorType.ExceededContextWindow).toBe('ExceededContextWindow');
    expect(AgentRuntimeErrorType.InvalidProviderAPIKey).toBe('InvalidProviderAPIKey');
    expect(AgentRuntimeErrorType.ProviderBizError).toBe('ProviderBizError');
    expect(AgentRuntimeErrorType.InvalidOllamaArgs).toBe('InvalidOllamaArgs');
    expect(AgentRuntimeErrorType.OllamaBizError).toBe('OllamaBizError');
    expect(AgentRuntimeErrorType.OllamaServiceUnavailable).toBe('OllamaServiceUnavailable');
    expect(AgentRuntimeErrorType.InvalidBedrockCredentials).toBe('InvalidBedrockCredentials');
    expect(AgentRuntimeErrorType.InvalidVertexCredentials).toBe('InvalidVertexCredentials');
    expect(AgentRuntimeErrorType.StreamChunkError).toBe('StreamChunkError');
    expect(AgentRuntimeErrorType.InvalidGithubToken).toBe('InvalidGithubToken');
    expect(AgentRuntimeErrorType.ConnectionCheckFailed).toBe('ConnectionCheckFailed');
    expect(AgentRuntimeErrorType.NoOpenAIAPIKey).toBe('NoOpenAIAPIKey');
  });

  it('should have all error types in AGENT_RUNTIME_ERROR_SET', () => {
    const errorTypes = Object.values(AgentRuntimeErrorType);
    expect(AGENT_RUNTIME_ERROR_SET.size).toBe(errorTypes.length);
    
    errorTypes.forEach((errorType) => {
      expect(AGENT_RUNTIME_ERROR_SET.has(errorType)).toBe(true);
    });
  });
});

describe('StandardErrorType', () => {
  it('should have correct HTTP status codes', () => {
    expect(StandardErrorType.BadRequest).toBe(400);
    expect(StandardErrorType.Unauthorized).toBe(401);
    expect(StandardErrorType.Forbidden).toBe(403);
    expect(StandardErrorType.ContentNotFound).toBe(404);
    expect(StandardErrorType.MethodNotAllowed).toBe(405);
    expect(StandardErrorType.TooManyRequests).toBe(429);
    expect(StandardErrorType.InternalServerError).toBe(500);
    expect(StandardErrorType.BadGateway).toBe(502);
    expect(StandardErrorType.ServiceUnavailable).toBe(503);
    expect(StandardErrorType.GatewayTimeout).toBe(504);
  });
});

describe('Type definitions', () => {
  it('should define ErrorType correctly', () => {
    const errorType: ErrorType = StandardErrorType.BadRequest;
    expect(typeof errorType).toBe('number');
  });

  it('should define ILobeAgentRuntimeErrorType correctly', () => {
    const runtimeErrorType: ILobeAgentRuntimeErrorType = AgentRuntimeErrorType.AgentRuntimeError;
    expect(typeof runtimeErrorType).toBe('string');
  });

  it('should define ChatMessageError interface correctly', () => {
    const error: ChatMessageError = {
      message: 'Test error',
      type: StandardErrorType.BadRequest,
    };
    expect(error.message).toBe('Test error');
    expect(error.type).toBe(400);

    const runtimeError: ChatMessageError = {
      message: 'Runtime error',
      type: AgentRuntimeErrorType.AgentRuntimeError,
      body: { details: 'error details' },
    };
    expect(runtimeError.message).toBe('Runtime error');
    expect(runtimeError.type).toBe('AgentRuntimeError');
    expect(runtimeError.body).toEqual({ details: 'error details' });
  });
});
