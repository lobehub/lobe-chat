import { describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '@/libs/agent-runtime';

import { OpenAIStream, transformOpenAIStream } from './openai';
import { FIRST_CHUNK_ERROR_KEY } from './protocol';

describe('transformOpenAIStream', () => {
  it('should transform OpenAI stream to protocol stream', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [{ delta: { content: 'Hello' }, index: 0 }],
          id: '1',
        });
        controller.enqueue({
          choices: [{ delta: { content: ' world!' }, index: 1 }],
          id: '1',
        });
        controller.enqueue({
          choices: [{ delta: null, finish_reason: 'stop', index: 2 }],
          id: '1',
        });
        controller.close();
      },
    });

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onTokenMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = OpenAIStream(mockOpenAIStream, {
      callbacks: {
        onCompletion: onCompletionMock,
        onStart: onStartMock,
        onText: onTextMock,
        onToken: onTokenMock,
      },
    });

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: 1\n',
      'event: text\n',
      'data: "Hello"\n\n',
      'id: 1\n',
      'event: text\n',
      'data: " world!"\n\n',
      'id: 1\n',
      'event: stop\n',
      'data: "stop"\n\n',
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, '"Hello"');
    expect(onTextMock).toHaveBeenNthCalledWith(2, '" world!"');
    expect(onTokenMock).toHaveBeenCalledTimes(2);
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('should handle empty stream', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([]);
  });

  it('should handle delta content null', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [{ delta: { content: null }, index: 0 }],
          id: '3',
        });
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(['id: 3\n', 'event: data\n', 'data: {"content":null}\n\n']);
  });

  it('should handle content with finish_reason', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: { content: 'Introduce yourself.', role: 'assistant' },
              finish_reason: 'stop',
              index: 0,
            },
          ],
          id: '123',
          model: 'deepl',
        });
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(['id: 123\n', 'event: text\n', 'data: "Introduce yourself."\n\n']);
  });

  it('should handle reasoning content', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [{ delta: { reasoning_content: 'Thinking...' }, index: 0 }],
          id: '4',
        });
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(['id: 4\n', 'event: reasoning\n', 'data: "Thinking..."\n\n']);
  });

  it('should handle reasoning field', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [{ delta: { reasoning: 'Thinking...' }, index: 0 }],
          id: '4',
        });
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(['id: 4\n', 'event: reasoning\n', 'data: "Thinking..."\n\n']);
  });

  it('should handle both content and reasoning', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: { content: 'Hello', reasoning_content: 'Thinking...' },
              index: 0,
            },
          ],
          id: '5',
        });
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(['id: 5\n', 'event: reasoning\n', 'data: "Thinking..."\n\n']);
  });

  it('should handle empty content and reasoning', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: { content: '', reasoning_content: '' },
              index: 0,
            },
          ],
          id: '6',
        });
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(['id: 6\n', 'event: reasoning\n', 'data: ""\n\n']);
  });

  it('should handle first chunk error', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          [FIRST_CHUNK_ERROR_KEY]: true,
          errorType: AgentRuntimeErrorType.ProviderBizError,
          message: 'Test error',
        });
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: first_chunk_error\n',
      'event: error\n',
      'data: {"body":{"errorType":"ProviderBizError","message":"Test error"},"type":"ProviderBizError"}\n\n',
    ]);
  });

  describe('Tool Calls', () => {
    it('should handle OpenAI tool calls', async () => {
      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      function: { arguments: '{}', name: 'tool1' },
                      id: 'call_1',
                      index: 0,
                      type: 'function',
                    },
                    {
                      function: { arguments: '{}', name: 'tool2' },
                      id: 'call_2',
                      index: 1,
                    },
                  ],
                },
                index: 0,
              },
            ],
            id: '2',
          });
          controller.close();
        },
      });

      const onToolCallMock = vi.fn();

      const protocolStream = OpenAIStream(mockOpenAIStream, {
        callbacks: { onToolCall: onToolCallMock },
      });

      const decoder = new TextDecoder();
      const chunks = [];

      // @ts-ignore
      for await (const chunk of protocolStream) {
        chunks.push(decoder.decode(chunk, { stream: true }));
      }

      expect(chunks).toEqual([
        'id: 2\n',
        'event: tool_calls\n',
        'data: [{"function":{"arguments":"{}","name":"tool1"},"id":"call_1","index":0,"type":"function"},{"function":{"arguments":"{}","name":"tool2"},"id":"call_2","index":1,"type":"function"}]\n\n',
      ]);

      expect(onToolCallMock).toHaveBeenCalledTimes(1);
    });

    it('should handle tool calls without index and type', async () => {
      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      function: { arguments: '{}', name: 'tool1' },
                      id: 'call_1',
                    },
                  ],
                },
                index: 0,
              },
            ],
            id: '5',
          });
          controller.close();
        },
      });

      const protocolStream = OpenAIStream(mockOpenAIStream);

      const decoder = new TextDecoder();
      const chunks = [];

      // @ts-ignore
      for await (const chunk of protocolStream) {
        chunks.push(decoder.decode(chunk, { stream: true }));
      }

      expect(chunks).toEqual([
        'id: 5\n',
        'event: tool_calls\n',
        'data: [{"function":{"arguments":"{}","name":"tool1"},"id":"call_1","index":0,"type":"function"}]\n\n',
      ]);
    });
  });
});
