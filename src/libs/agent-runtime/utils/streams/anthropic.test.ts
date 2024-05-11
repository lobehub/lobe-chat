import type { Stream } from '@anthropic-ai/sdk/streaming';
import { describe, expect, it, vi } from 'vitest';

import { AnthropicStream } from './anthropic';

describe('AnthropicStream', () => {
  it('should transform Anthropic stream to protocol stream', async () => {
    // @ts-ignore
    const mockAnthropicStream: Stream = {
      [Symbol.asyncIterator]() {
        let count = 0;
        return {
          next: async () => {
            switch (count) {
              case 0:
                count++;
                return {
                  done: false,
                  value: {
                    type: 'message_start',
                    message: { id: 'message_1', metadata: {} },
                  },
                };
              case 1:
                count++;
                return {
                  done: false,
                  value: {
                    type: 'content_block_delta',
                    delta: { type: 'text_delta', text: 'Hello' },
                  },
                };
              case 2:
                count++;
                return {
                  done: false,
                  value: {
                    type: 'content_block_delta',
                    delta: { type: 'text_delta', text: ' world!' },
                  },
                };
              case 3:
                count++;
                return {
                  done: false,
                  value: {
                    type: 'message_delta',
                    delta: { stop_reason: 'stop' },
                  },
                };
              default:
                return { done: true, value: undefined };
            }
          },
        };
      },
    };

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onTokenMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = AnthropicStream(mockAnthropicStream, {
      onStart: onStartMock,
      onText: onTextMock,
      onToken: onTokenMock,
      onCompletion: onCompletionMock,
    });

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: message_1\n',
      'event: data\n',
      `data: {"id":"message_1","metadata":{}}\n\n`,
      'id: message_1\n',
      'event: text\n',
      `data: "Hello"\n\n`,
      'id: message_1\n',
      'event: text\n',
      `data: " world!"\n\n`,
      'id: message_1\n',
      'event: stop\n',
      `data: "stop"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, '"Hello"');
    expect(onTextMock).toHaveBeenNthCalledWith(2, '" world!"');
    expect(onTokenMock).toHaveBeenCalledTimes(2);
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('should handle tool use event and ReadableStream input', async () => {
    const toolUseEvent = {
      type: 'content_block_delta',
      delta: {
        type: 'tool_use',
        tool_use: {
          id: 'tool_use_1',
          name: 'example_tool',
          input: { arg1: 'value1' },
        },
      },
    };

    const mockReadableStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          type: 'message_start',
          message: { id: 'message_1', metadata: {} },
        });
        controller.enqueue(toolUseEvent);
        controller.enqueue({
          type: 'message_stop',
        });
        controller.close();
      },
    });

    const onToolCallMock = vi.fn();

    const protocolStream = AnthropicStream(mockReadableStream, {
      onToolCall: onToolCallMock,
    });

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: message_1\n',
      'event: data\n',
      `data: {"id":"message_1","metadata":{}}\n\n`,
      'id: message_1\n',
      'event: tool_calls\n',
      `data: [{"function":{"arguments":"{\\"arg1\\":\\"value1\\"}","name":"example_tool"},"id":"tool_use_1","index":0,"type":"function"}]\n\n`,
      'id: message_1\n',
      'event: stop\n',
      `data: "message_stop"\n\n`,
    ]);

    expect(onToolCallMock).toHaveBeenCalledTimes(1);
  });

  it('should handle ReadableStream input', async () => {
    const mockReadableStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          type: 'message_start',
          message: { id: 'message_1', metadata: {} },
        });
        controller.enqueue({
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello' },
        });
        controller.enqueue({
          type: 'message_stop',
        });
        controller.close();
      },
    });

    const protocolStream = AnthropicStream(mockReadableStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: message_1\n',
      'event: data\n',
      `data: {"id":"message_1","metadata":{}}\n\n`,
      'id: message_1\n',
      'event: text\n',
      `data: "Hello"\n\n`,
      'id: message_1\n',
      'event: stop\n',
      `data: "message_stop"\n\n`,
    ]);
  });
});
