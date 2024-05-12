import { describe, expect, it } from 'vitest';

import { AgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

import { createErrorResponse } from './errorResponse';

describe('createErrorResponse', () => {
  // 测试各种错误类型的状态码
  it('returns a 401 status for NoOpenAIAPIKey error type', () => {
    const errorType = ChatErrorType.NoOpenAIAPIKey;
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(401);
  });

  it('returns a 401 status for InvalidAccessCode error type', () => {
    const errorType = ChatErrorType.InvalidAccessCode;
    const response = createErrorResponse(errorType as any);
    expect(response.status).toBe(401);
  });

  // 测试包含Invalid的错误类型
  it('returns a 401 status for Invalid error type', () => {
    const errorType = 'InvalidTestError';
    const response = createErrorResponse(errorType as any);
    expect(response.status).toBe(401);
  });

  it('returns a 403 status for LocationNotSupportError error type', () => {
    const errorType = AgentRuntimeErrorType.LocationNotSupportError;
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(403);
  });

  describe('Provider Biz Error', () => {
    it('returns a 471 status for OpenAIBizError error type', () => {
      const errorType = ChatErrorType.OpenAIBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(471);
    });

    it('returns a 470 status for AgentRuntimeError error type', () => {
      const errorType = AgentRuntimeErrorType.AgentRuntimeError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(470);
    });

    it('returns a 471 status for OpenAIBizError error type', () => {
      const errorType = AgentRuntimeErrorType.OpenAIBizError;
      const response = createErrorResponse(errorType as any);
      expect(response.status).toBe(471);
    });

    // 测试 AzureBizError 错误类型返回472状态码
    it('returns a 472 status for AzureBizError error type', () => {
      const errorType = AgentRuntimeErrorType.AzureBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(472);
    });

    // 测试 ZhipuBizError 错误类型返回473状态码
    it('returns a 473 status for ZhipuBizError error type', () => {
      const errorType = AgentRuntimeErrorType.ZhipuBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(473);
    });

    // 测试 BedrockBizError 错误类型返回474状态码
    it('returns a 474 status for BedrockBizError error type', () => {
      const errorType = AgentRuntimeErrorType.BedrockBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(474);
    });

    // 测试 GoogleBizError 错误类型返回475状态码
    it('returns a 475 status for GoogleBizError error type', () => {
      const errorType = AgentRuntimeErrorType.GoogleBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(475);
    });

    // 测试 MoonshotBizError 错误类型返回476状态码
    it('returns a 476 status for MoonshotBizError error type', () => {
      const errorType = AgentRuntimeErrorType.MoonshotBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(476);
    });

    // 测试 OpenRouterBizError 错误类型返回477状态码
    it('returns a 477 status for OpenRouterBizError error type', () => {
      const errorType = AgentRuntimeErrorType.OpenRouterBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(477);
    });

    // 测试 OllamaBizError 错误类型返回478状态码
    it('returns a 478 status for OllamaBizError error type', () => {
      const errorType = AgentRuntimeErrorType.OllamaBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(478);
    });

    // 测试 PerplexityBizError 错误类型返回479状态码
    it('returns a 479 status for PerplexityBizError error type', () => {
      const errorType = AgentRuntimeErrorType.PerplexityBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(479);
    });

    // 测试 AnthropicBizError 错误类型返回480状态码
    it('returns a 480 status for AnthropicBizError error type', () => {
      const errorType = AgentRuntimeErrorType.AnthropicBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(480);
    });

    // 测试 MistralBizError 错误类型返回481状态码
    it('returns a 481 status for MistralBizError error type', () => {
      const errorType = AgentRuntimeErrorType.MistralBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(481);
    });

    it('returns a 484 status for TogetherAIBizError error type', () => {
      const errorType = AgentRuntimeErrorType.TogetherAIBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(484);
    });

    it('returns a 485 status for MinimaxBizError error type', () => {
      const errorType = AgentRuntimeErrorType.MinimaxBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(485);
    });

    it('returns a 486 status for DeepSeekBizError error type', () => {
      const errorType = AgentRuntimeErrorType.DeepSeekBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(486);
    });
  });

  // 测试状态码不在200-599范围内的情况
  it('logs an error when the status code is not a number or not in the range of 200-599', () => {
    const errorType = 'Unknown Error';
    const consoleSpy = vi.spyOn(console, 'error');
    try {
      createErrorResponse(errorType as any);
    } catch (e) {}
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // 测试默认情况
  it('returns the same error type as status for unknown error types', () => {
    const errorType = 500; // 假设500是一个未知的错误类型
    const response = createErrorResponse(errorType as any);
    expect(response.status).toBe(errorType);
  });

  // 测试返回的Response对象是否包含正确的body和errorType
  it('returns a Response object with the correct body and errorType', () => {
    const errorType = ChatErrorType.NoOpenAIAPIKey;
    const body = { message: 'No API key provided' };
    const response = createErrorResponse(errorType, body);
    return response.json().then((data) => {
      expect(data).toEqual({
        body,
        errorType,
      });
    });
  });

  // 测试没有提供body时，返回的Response对象的body是否为undefined
  it('returns a Response object with an undefined body when no body is provided', () => {
    const errorType = ChatErrorType.NoOpenAIAPIKey;
    const response = createErrorResponse(errorType);
    return response.json().then((data) => {
      expect(data.body).toBeUndefined();
    });
  });
});
