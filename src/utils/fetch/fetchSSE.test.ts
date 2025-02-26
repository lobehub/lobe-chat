import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventSourceMessage } from './fetchEventSource/parse';
import { fetchSSE } from './fetchSSE';

vi.mock('./fetchEventSource', () => ({
  fetchEventSource: vi.fn(),
}));

describe('fetchSSE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should handle text messages smoothly', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response('', {
      headers: {
        'content-type': 'text/event-stream',
      },
    });

    const { fetchEventSource } = await import('./fetchEventSource');
    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen!(mockResponse);

      const messages: EventSourceMessage[] = [
        {
          data: JSON.stringify('Hello'),
          event: 'text',
          id: '',
          retry: undefined,
        },
        {
          data: JSON.stringify(' World'),
          event: 'text',
          id: '',
          retry: undefined,
        },
      ];

      for (const message of messages) {
        options.onmessage?.(message);
        await vi.runOnlyPendingTimersAsync();
      }
    });

    const promise = fetchSSE('test-url', {
      onFinish,
      onMessageHandle,
      smoothing: false,
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(onMessageHandle).toHaveBeenNthCalledWith(1, {
      text: 'Hello',
      type: 'text',
    });

    expect(onMessageHandle).toHaveBeenNthCalledWith(2, {
      text: ' World',
      type: 'text',
    });

    expect(onFinish).toHaveBeenCalledWith('Hello World', {
      grounding: undefined,
      observationId: null,
      reasoning: undefined,
      toolCalls: undefined,
      traceId: null,
      type: 'done',
    });
  });

  it('should handle reasoning messages', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response('', {
      headers: {
        'content-type': 'text/event-stream',
      },
    });

    const { fetchEventSource } = await import('./fetchEventSource');
    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen!(mockResponse);

      const messages: EventSourceMessage[] = [
        {
          data: JSON.stringify('signature123'),
          event: 'reasoning_signature',
          id: '',
          retry: undefined,
        },
        {
          data: JSON.stringify('thinking...'),
          event: 'reasoning',
          id: '',
          retry: undefined,
        },
      ];

      for (const message of messages) {
        options.onmessage?.(message);
        await vi.runOnlyPendingTimersAsync();
      }
    });

    const promise = fetchSSE('test-url', {
      onFinish,
      onMessageHandle,
      smoothing: false,
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(onMessageHandle).toHaveBeenCalledWith({
      text: 'thinking...',
      type: 'reasoning',
    });

    expect(onFinish).toHaveBeenCalledWith('', {
      grounding: undefined,
      observationId: null,
      reasoning: {
        content: 'thinking...',
        signature: 'signature123',
      },
      toolCalls: undefined,
      traceId: null,
      type: 'done',
    });
  });

  it('should handle tool calls', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response('', {
      headers: {
        'content-type': 'text/event-stream',
      },
    });

    const toolCall = {
      function: {
        arguments: 'test args',
        name: 'testFunc',
      },
      id: '123',
      index: 0,
      type: 'function',
    };

    const { fetchEventSource } = await import('./fetchEventSource');
    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen!(mockResponse);

      const message: EventSourceMessage = {
        data: JSON.stringify([toolCall]),
        event: 'tool_calls',
        id: '',
        retry: undefined,
      };

      options.onmessage?.(message);
      await vi.runOnlyPendingTimersAsync();
    });

    const promise = fetchSSE('test-url', {
      onFinish,
      onMessageHandle,
      smoothing: false,
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(onMessageHandle).toHaveBeenCalledWith({
      tool_calls: [
        {
          function: {
            arguments: 'test args',
            name: 'testFunc',
          },
          id: '123',
          type: 'function',
        },
      ],
      type: 'tool_calls',
    });

    expect(onFinish).toHaveBeenCalledWith('', {
      grounding: undefined,
      observationId: null,
      reasoning: undefined,
      toolCalls: [
        {
          function: {
            arguments: 'test args',
            name: 'testFunc',
          },
          id: '123',
          type: 'function',
        },
      ],
      traceId: null,
      type: 'done',
    });
  });

  it('should handle errors', async () => {
    const onErrorHandle = vi.fn();

    const { fetchEventSource } = await import('./fetchEventSource');
    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      const message: EventSourceMessage = {
        data: JSON.stringify({
          message: 'Test error',
          type: 'StreamChunkError',
        }),
        event: 'error',
        id: '',
        retry: undefined,
      };

      options.onmessage?.(message);
    });

    await fetchSSE('test-url', {
      onErrorHandle,
    });

    expect(onErrorHandle).toHaveBeenCalledWith({
      message: 'Test error',
      type: 'StreamChunkError',
    });
  });

  it('should handle aborts', async () => {
    const onAbort = vi.fn();

    const { fetchEventSource } = await import('./fetchEventSource');
    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      options.onerror?.('canceled');
    });

    await fetchSSE('test-url', {
      onAbort,
    });

    expect(onAbort).toHaveBeenCalledWith('');
  });
});
