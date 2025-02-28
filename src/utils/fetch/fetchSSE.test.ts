import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchEventSource } from './fetchEventSource';
import { fetchSSE } from './fetchSSE';

vi.mock('./fetchEventSource', () => ({
  fetchEventSource: vi.fn(),
}));

describe('fetchSSE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle text smoothing', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response('', {
      headers: { 'content-type': 'text/event-stream' },
    });

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      await options.onmessage?.({
        data: JSON.stringify('Hello'),
        event: 'text',
        id: '',
        retry: 0,
      });
    });

    await fetchSSE('test-url', {
      onFinish,
      onMessageHandle,
      smoothing: false,
    });

    expect(onMessageHandle).toHaveBeenCalledWith({
      text: 'Hello',
      type: 'text',
    });
  });

  it('should handle tool calls without smoothing', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response('', {
      headers: { 'content-type': 'text/event-stream' },
    });

    const toolCallData = [
      {
        function: {
          arguments: 'test args',
          name: 'test',
        },
        id: 'test',
        index: 0,
        type: 'function',
      },
    ];

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      await options.onmessage?.({
        data: JSON.stringify(toolCallData),
        event: 'tool_calls',
        id: '',
        retry: 0,
      });
    });

    await fetchSSE('test-url', {
      onFinish,
      onMessageHandle,
      smoothing: {
        toolsCalling: false,
      },
    });

    expect(onMessageHandle).toHaveBeenCalledWith({
      tool_calls: expect.arrayContaining([
        expect.objectContaining({
          function: expect.objectContaining({
            arguments: 'test args',
            name: 'test',
          }),
        }),
      ]),
      type: 'tool_calls',
    });
  });

  it('should handle errors during streaming', async () => {
    const onErrorHandle = vi.fn();
    const error = new Error('Stream error');

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onerror?.(error);
    });

    await fetchSSE('test-url', {
      onErrorHandle,
    });

    expect(onErrorHandle).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Stream error',
        type: 'UnknownChatFetchError',
      }),
    );
  });

  it('should handle reasoning messages without smoothing', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response('', {
      headers: { 'content-type': 'text/event-stream' },
    });

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      await options.onmessage?.({
        data: JSON.stringify('thinking...'),
        event: 'reasoning',
        id: '',
        retry: 0,
      });
    });

    await fetchSSE('test-url', {
      onFinish,
      onMessageHandle,
      smoothing: false,
    });

    expect(onMessageHandle).toHaveBeenCalledWith({
      text: 'thinking...',
      type: 'reasoning',
    });
  });

  it('should handle grounding messages', async () => {
    const onMessageHandle = vi.fn();
    const groundingData = {
      citations: [{ url: 'test.com' }],
      searchQueries: ['test query'],
    };

    const mockResponse = new Response('', {
      headers: { 'content-type': 'text/event-stream' },
    });

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      await options.onmessage?.({
        data: JSON.stringify(groundingData),
        event: 'grounding',
        id: '',
        retry: 0,
      });
    });

    await fetchSSE('test-url', {
      onMessageHandle,
    });

    expect(onMessageHandle).toHaveBeenCalledWith({
      grounding: groundingData,
      type: 'grounding',
    });
  });
});
