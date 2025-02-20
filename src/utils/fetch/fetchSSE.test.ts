import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MESSAGE_CANCEL_FLAT } from '@/const/message';
import { LOBE_CHAT_OBSERVATION_ID, LOBE_CHAT_TRACE_ID } from '@/const/trace';
import { ChatErrorType } from '@/types/fetch';
import { CitationItem, MessageToolCall } from '@/types/message';

import { fetchEventSource } from './fetchEventSource';
import { fetchSSE } from './fetchSSE';

vi.mock('./fetchEventSource');

describe('fetchSSE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful text streaming', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response(null, {
      headers: {
        [LOBE_CHAT_TRACE_ID]: 'trace-123',
        [LOBE_CHAT_OBSERVATION_ID]: 'obs-123',
      },
    });
    Object.defineProperty(mockResponse, 'ok', { value: true });

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      options.onmessage?.({ data: JSON.stringify('Hello'), event: 'text', id: '1' });
      options.onmessage?.({ data: JSON.stringify(' World'), event: 'text', id: '2' });
    });

    await fetchSSE('test-url', {
      onMessageHandle,
      onFinish,
    });

    expect(onMessageHandle).toHaveBeenCalledWith({ text: 'Hello', type: 'text' });
    expect(onMessageHandle).toHaveBeenCalledWith({ text: ' World', type: 'text' });
    expect(onFinish).toHaveBeenCalledWith('Hello World', {
      observationId: 'obs-123',
      traceId: 'trace-123',
      type: 'done',
    });
  });

  it('should handle tool calls streaming', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response(null);
    Object.defineProperty(mockResponse, 'ok', { value: true });

    const toolCall: MessageToolCall = {
      id: 'call-1',
      type: 'function',
      function: {
        name: 'test',
        arguments: 'args',
      },
    };

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      options.onmessage?.({
        data: JSON.stringify([{ index: 0, ...toolCall }]),
        event: 'tool_calls',
        id: '1',
      });
    });

    await fetchSSE('test-url', {
      onMessageHandle,
      onFinish,
      smoothing: false,
    });

    expect(onMessageHandle).toHaveBeenCalledWith({
      tool_calls: [toolCall],
      type: 'tool_calls',
    });
  });

  it('should handle citations streaming', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response(null);
    Object.defineProperty(mockResponse, 'ok', { value: true });

    const citations: CitationItem[] = [
      {
        id: 'cite-1',
        url: 'http://example.com',
      },
    ];

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      options.onmessage?.({
        data: JSON.stringify(citations),
        event: 'citations',
        id: '1',
      });
    });

    await fetchSSE('test-url', {
      onMessageHandle,
      onFinish,
    });

    expect(onMessageHandle).toHaveBeenCalledWith({
      citations,
      type: 'citations',
    });
  });

  it('should handle reasoning streaming', async () => {
    const onMessageHandle = vi.fn();
    const onFinish = vi.fn();

    const mockResponse = new Response(null);
    Object.defineProperty(mockResponse, 'ok', { value: true });

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      options.onmessage?.({
        data: JSON.stringify('thinking...'),
        event: 'reasoning',
        id: '1',
      });
    });

    await fetchSSE('test-url', {
      onMessageHandle,
      onFinish,
    });

    expect(onMessageHandle).toHaveBeenCalledWith({
      text: 'thinking...',
      type: 'reasoning',
    });
  });

  it('should handle abort', async () => {
    const onAbort = vi.fn();
    const mockResponse = new Response(null);

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      options.onerror?.(MESSAGE_CANCEL_FLAT);
    });

    await fetchSSE('test-url', { onAbort });

    expect(onAbort).toHaveBeenCalledWith('');
  });

  it('should handle errors', async () => {
    const onErrorHandle = vi.fn();
    const mockResponse = new Response(null);

    const error = {
      type: ChatErrorType.UnknownChatFetchError,
      message: 'test error',
    };

    vi.mocked(fetchEventSource).mockImplementation(async (_, options) => {
      await options.onopen?.(mockResponse);
      options.onmessage?.({
        data: JSON.stringify(error),
        event: 'error',
        id: '1',
      });
    });

    await fetchSSE('test-url', { onErrorHandle });

    expect(onErrorHandle).toHaveBeenCalledWith(error);
  });
});
