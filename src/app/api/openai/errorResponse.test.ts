import { describe, expect, it } from 'vitest';

import { ChatErrorType } from '@/types/fetch';

import { createErrorResponse } from './errorResponse';

describe('createErrorResponse', () => {
  // 测试各种错误类型的状态码
  it('returns a 401 status for NoAPIKey error type', () => {
    const errorType = ChatErrorType.NoAPIKey;
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(401);
  });

  it('returns a 401 status for InvalidAccessCode error type', () => {
    const errorType = ChatErrorType.InvalidAccessCode;
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(401);
  });

  it('returns a 577 status for OpenAIBizError error type', () => {
    const errorType = ChatErrorType.OpenAIBizError;
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(577);
  });

  // 测试默认情况
  it('returns the same error type as status for unknown error types', () => {
    const errorType = 500; // 假设500是一个未知的错误类型
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(errorType);
  });

  // 测试返回的Response对象是否包含正确的body和errorType
  it('returns a Response object with the correct body and errorType', () => {
    const errorType = ChatErrorType.NoAPIKey;
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
    const errorType = ChatErrorType.NoAPIKey;
    const response = createErrorResponse(errorType);
    return response.json().then((data) => {
      expect(data.body).toBeUndefined();
    });
  });
});
