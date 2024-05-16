import { fetchEventSource } from '@microsoft/fetch-event-source';
import { FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { ErrorResponse } from '@/types/fetch';

import { fetchSSE, getMessageError, parseToolCalls } from './fetch';

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

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn(),
}));

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

  it('should handle timeout error correctly', async () => {
    const mockResponse = createMockResponse(undefined, false, 504);
    const error = await getMessageError(mockResponse as any);

    expect(error).toEqual({
      message: 'translated_response.504',
      type: 504,
    });
  });
});

describe('parseToolCalls', () => {
  it('should create add new item', () => {
    const chunk = [
      { index: 0, id: '1', type: 'function', function: { name: 'func', arguments: '' } },
    ];

    const result = parseToolCalls([], chunk);
    expect(result).toEqual([
      { id: '1', type: 'function', function: { name: 'func', arguments: '' } },
    ]);
  });

  it('should update arguments if there is a toolCall', () => {
    const origin = [{ id: '1', type: 'function', function: { name: 'func', arguments: '' } }];

    const chunk1 = [{ index: 0, function: { arguments: '{"lo' } }];

    const result1 = parseToolCalls(origin, chunk1);
    expect(result1).toEqual([
      { id: '1', type: 'function', function: { name: 'func', arguments: '{"lo' } },
    ]);

    const chunk2 = [{ index: 0, function: { arguments: 'cation\\": \\"Hangzhou\\"}' } }];
    const result2 = parseToolCalls(result1, chunk2);

    expect(result2).toEqual([
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
    ]);
  });

  it('should add a new tool call if the index is different', () => {
    const origin = [
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
    ];

    const chunk = [
      {
        index: 1,
        id: '2',
        type: 'function',
        function: { name: 'func', arguments: '' },
      },
    ];

    const result1 = parseToolCalls(origin, chunk);
    expect(result1).toEqual([
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
      { id: '2', type: 'function', function: { name: 'func', arguments: '' } },
    ]);
  });

  it('should update correct arguments if there are multi tool calls', () => {
    const origin = [
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
      { id: '2', type: 'function', function: { name: 'func', arguments: '' } },
    ];

    const chunk = [{ index: 1, function: { arguments: '{"location\\": \\"Beijing\\"}' } }];

    const result1 = parseToolCalls(origin, chunk);
    expect(result1).toEqual([
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
      {
        id: '2',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Beijing\\"}' },
      },
    ]);
  });

  it('should throw error if incomplete tool calls data', () => {
    const origin = [
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
    ];

    const chunk = [{ index: 1, id: '2', type: 'function' }];

    try {
      parseToolCalls(origin, chunk as any);
    } catch (e) {
      expect(e).toEqual(
        new ZodError([
          {
            code: 'invalid_type',
            expected: 'object',
            received: 'undefined',
            path: ['function'],
            message: 'Required',
          },
        ]),
      );
    }
  });
});

describe('fetchSSE', () => {
  it('should handle text event correctly', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify(' World') } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
      smoothing: false,
    });

    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(1, { text: 'Hello', type: 'text' });
    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(2, { text: ' World', type: 'text' });
    expect(mockOnFinish).toHaveBeenCalledWith('Hello World', {
      observationId: null,
      toolCalls: undefined,
      traceId: null,
      type: 'done',
    });
  });

  it('should handle tool_calls event correctly', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({
          event: 'tool_calls',
          data: JSON.stringify([
            { index: 0, id: '1', type: 'function', function: { name: 'func1', arguments: 'arg1' } },
          ]),
        } as any);
        options.onmessage!({
          event: 'tool_calls',
          data: JSON.stringify([
            { index: 1, id: '2', type: 'function', function: { name: 'func2', arguments: 'arg2' } },
          ]),
        } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
      smoothing: false,
    });

    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(1, {
      tool_calls: [{ id: '1', type: 'function', function: { name: 'func1', arguments: 'arg1' } }],
      type: 'tool_calls',
    });
    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(2, {
      tool_calls: [
        { id: '1', type: 'function', function: { name: 'func1', arguments: 'arg1' } },
        { id: '2', type: 'function', function: { name: 'func2', arguments: 'arg2' } },
      ],
      type: 'tool_calls',
    });
    expect(mockOnFinish).toHaveBeenCalledWith('', {
      observationId: null,
      toolCalls: [
        { id: '1', type: 'function', function: { name: 'func1', arguments: 'arg1' } },
        { id: '2', type: 'function', function: { name: 'func2', arguments: 'arg2' } },
      ],
      traceId: null,
      type: 'done',
    });
  });

  it('should call onAbort when AbortError is thrown', async () => {
    const mockOnAbort = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        options.onerror!({ name: 'AbortError' });
      },
    );

    await fetchSSE('/', { onAbort: mockOnAbort, smoothing: false });

    expect(mockOnAbort).toHaveBeenCalledWith('Hello');
  });

  it('should call onErrorHandle when other error is thrown', async () => {
    const mockOnErrorHandle = vi.fn();
    const mockError = new Error('Unknown error');

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onerror!(mockError);
      },
    );

    try {
      await fetchSSE('/', { onErrorHandle: mockOnErrorHandle });
    } catch (e) {}

    expect(mockOnErrorHandle).toHaveBeenCalled();
  });

  it('should call onErrorHandle when response is not ok', async () => {
    const mockOnErrorHandle = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      async (url: string, options: FetchEventSourceInit) => {
        const res = new Response(JSON.stringify({ errorType: 'SomeError' }), {
          status: 400,
          statusText: 'Error',
        });

        try {
          await options.onopen!(res as any);
        } catch (e) {}
      },
    );

    try {
      await fetchSSE('/', { onErrorHandle: mockOnErrorHandle });
    } catch (e) {
      expect(mockOnErrorHandle).toHaveBeenCalledWith({
        body: undefined,
        message: 'translated_response.SomeError',
        type: 'SomeError',
      });
    }
  });

  it('should call onMessageHandle with full text if no message event', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        const res = new Response('Hello World', { status: 200, statusText: 'OK' });
        options.onopen!(res as any);
      },
    );

    await fetchSSE('/', { onMessageHandle: mockOnMessageHandle, onFinish: mockOnFinish });

    expect(mockOnMessageHandle).toHaveBeenCalledWith({ text: 'Hello World', type: 'text' });
    expect(mockOnFinish).toHaveBeenCalledWith('Hello World', {
      observationId: null,
      toolCalls: undefined,
      traceId: null,
      type: 'done',
    });
  });

  it('should handle text event with smoothing correctly', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify(' World') } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
    });

    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(1, { text: 'He', type: 'text' });
    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(2, { text: 'llo World', type: 'text' });
    // more assertions for each character...
    expect(mockOnFinish).toHaveBeenCalledWith('Hello World', {
      observationId: null,
      toolCalls: undefined,
      traceId: null,
      type: 'done',
    });
  });

  it('should handle tool_calls event with smoothing correctly', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({
          event: 'tool_calls',
          data: JSON.stringify([
            { index: 0, id: '1', type: 'function', function: { name: 'func1', arguments: 'a' } },
          ]),
        } as any);
        options.onmessage!({
          event: 'tool_calls',
          data: JSON.stringify([
            { index: 0, function: { arguments: 'rg1' } },
            { index: 1, id: '2', type: 'function', function: { name: 'func2', arguments: 'a' } },
          ]),
        } as any);
        options.onmessage!({
          event: 'tool_calls',
          data: JSON.stringify([{ index: 1, function: { arguments: 'rg2' } }]),
        } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
    });

    // TODO: need to check whether the `aarg1` is correct
    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(1, {
      isAnimationActives: [true],
      tool_calls: [
        { id: '1', type: 'function', function: { name: 'func1', arguments: 'aarg1' } },
        { function: { arguments: 'aarg2', name: 'func2' }, id: '2', type: 'function' },
      ],
      type: 'tool_calls',
    });
    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(2, {
      isAnimationActives: [true, true],
      tool_calls: [
        { id: '1', type: 'function', function: { name: 'func1', arguments: 'aarg1' } },
        { id: '2', type: 'function', function: { name: 'func2', arguments: 'aarg2' } },
      ],
      type: 'tool_calls',
    });

    // more assertions for each character...
    expect(mockOnFinish).toHaveBeenCalledWith('', {
      observationId: null,
      toolCalls: [
        { id: '1', type: 'function', function: { name: 'func1', arguments: 'arg1' } },
        { id: '2', type: 'function', function: { name: 'func2', arguments: 'arg2' } },
      ],
      traceId: null,
      type: 'done',
    });
  });

  it('should handle request interruption and resumption correctly', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();
    const abortController = new AbortController();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        abortController.abort();
        options.onmessage!({ event: 'text', data: JSON.stringify(' World') } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
      signal: abortController.signal,
    });

    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(1, { text: 'He', type: 'text' });
    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(2, { text: 'llo World', type: 'text' });

    expect(mockOnFinish).toHaveBeenCalledWith('Hello World', {
      type: 'done',
      observationId: null,
      traceId: null,
    });
  });

  it('should call onFinish with correct parameters for different finish types', async () => {
    const mockOnFinish = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        options.onerror!({ name: 'AbortError' });
      },
    );

    await fetchSSE('/', { onFinish: mockOnFinish, smoothing: false });

    expect(mockOnFinish).toHaveBeenCalledWith('Hello', {
      observationId: null,
      toolCalls: undefined,
      traceId: null,
      type: 'abort',
    });

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        options.onerror!(new Error('Unknown error'));
      },
    );

    await fetchSSE('/', { onFinish: mockOnFinish, smoothing: false });

    expect(mockOnFinish).toHaveBeenCalledWith('Hello', {
      observationId: null,
      toolCalls: undefined,
      traceId: null,
      type: 'error',
    });
  });
});
