import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorResponse, ErrorType } from '@/types/fetch';

import { fetchAIFactory, fetchSSE, getMessageError } from './fetch';

// 模拟 i18next
vi.mock('i18next', () => ({
  t: vi.fn((key) => `translated_${key}`),
}));

// 模拟 Response
const createMockResponse = (body: any, ok: boolean, status: number = 200) => ({
  ok,
  status,
  json: vi.fn(async () => body),
  clone: vi.fn(function () {
    // @ts-ignore
    return this;
  }),
  text: vi.fn(async () => JSON.stringify(body)),
  body: {
    getReader: () => {
      let done = false;
      return {
        read: () => {
          if (!done) {
            done = true;
            return Promise.resolve({
              value: new TextEncoder().encode(JSON.stringify(body)),
              done: false,
            });
          } else {
            return Promise.resolve({ done: true });
          }
        },
      };
    },
  },
});

// 在每次测试后清理所有模拟
afterEach(() => {
  vi.restoreAllMocks();
});

describe('getMessageError', () => {
  it('should handle business error correctly', async () => {
    const mockErrorResponse: ErrorResponse = {
      body: 'Error occurred',
      errorType: 'InvalidAccessCode',
    };
    const mockResponse = createMockResponse(mockErrorResponse, false, 400);

    const error = await getMessageError(mockResponse as any);

    expect(error).toEqual({
      body: mockErrorResponse.body,
      message: 'translated_response.InvalidAccessCode',
      type: mockErrorResponse.errorType,
    });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle regular error correctly', async () => {
    const mockResponse = createMockResponse({}, false, 500);
    mockResponse.json.mockImplementationOnce(() => {
      throw new Error('Failed to parse');
    });

    const error = await getMessageError(mockResponse as any);

    expect(error).toEqual({
      message: 'translated_response.500',
      type: 500,
    });
    expect(mockResponse.json).toHaveBeenCalled();
  });
});

describe('fetchAIFactory', () => {
  it('should handle successful response', async () => {
    const fetcher = async (params: any, options: any) =>
      new Response('AI response', { status: 200 });
    const params = {
      /* mock params */
    };
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();
    const onError = vi.fn();
    const onLoadingChange = vi.fn();
    const abortController = new AbortController();

    const fetchAIFn = fetchAIFactory(fetcher);
    const result = await fetchAIFn({
      params,
      onMessageHandle,
      onFinish,
      onError,
      onLoadingChange,
      abortController,
    });

    expect(result).toBe('AI response');
    expect(onMessageHandle).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onLoadingChange).toHaveBeenCalledTimes(2);
  });

  it('should handle error response', async () => {
    const fetcher = async (params: any, options: any) =>
      new Response(null, { status: 404, statusText: 'Not Found' });
    const params = {
      /* mock params */
    };
    const onError = vi.fn();
    const onLoadingChange = vi.fn();
    const abortController = new AbortController();

    const fetchAIFn = fetchAIFactory(fetcher);
    await fetchAIFn({ params, onError, onLoadingChange, abortController });

    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      message: 'translated_response.404',
      type: 404,
    });
    expect(onLoadingChange).toHaveBeenCalledTimes(3);
    expect(onLoadingChange.mock.lastCall).toEqual([false]);
  });
});
