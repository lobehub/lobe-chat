import { describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '@/libs/agent-runtime';

import { OpenAIStream } from './openai';
import { FIRST_CHUNK_ERROR_KEY } from './protocol';

describe('OpenAIStream', () => {
  it('should transform OpenAI stream to protocol stream', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: { content: 'Hello' },
              index: 0,
            },
          ],
          id: '1',
        });
        controller.enqueue({
          choices: [
            {
              delta: { content: ' world!' },
              index: 1,
            },
          ],
          id: '1',
        });
        controller.enqueue({
          choices: [
            {
              delta: null,
              finish_reason: 'stop',
              index: 2,
            },
          ],
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
        onStart: onStartMock,
        onText: onTextMock,
        onToken: onTokenMock,
        onCompletion: onCompletionMock,
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
      `data: "Hello"\n\n`,
      'id: 1\n',
      'event: text\n',
      `data: " world!"\n\n`,
      'id: 1\n',
      'event: stop\n',
      `data: "stop"\n\n`,
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
          choices: [
            {
              delta: { content: null },
              index: 0,
            },
          ],
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

    expect(chunks).toEqual(['id: 3\n', 'event: data\n', `data: {"content":null}\n\n`]);
  });

  it('should handle content with finish_reason', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          id: '123',
          model: 'deepl',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', content: 'Introduce yourself.' },
              finish_reason: 'stop',
            },
          ],
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

    expect(chunks).toEqual(
      ['id: 123', 'event: text', `data: "Introduce yourself."\n`].map((i) => `${i}\n`),
    );
  });

  it('should handle content with tool_calls but is an empty object', async () => {
    // data: {"id":"chatcmpl-A7pokGUqSov0JuMkhiHhWU9GRtAgJ", "object":"chat.completion.chunk", "created":1726430846, "model":"gpt-4o-2024-05-13", "choices":[{"index":0, "delta":{"content":" today", "role":"", "tool_calls":[]}, "finish_reason":"", "logprobs":""}], "prompt_annotations":[{"prompt_index":0, "content_filter_results":null}]}
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              index: 0,
              delta: {
                content: 'Some contents',
                role: '',
                tool_calls: [],
              },
              finish_reason: '',
              logprobs: '',
            },
          ],
          id: '456',
        });

        controller.close();
      },
    });

    const onToolCallMock = vi.fn();

    const protocolStream = OpenAIStream(mockOpenAIStream, {
      callbacks: {
        onToolCall: onToolCallMock,
      },
    });

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(
      ['id: 456', 'event: text', `data: "Some contents"\n`].map((i) => `${i}\n`),
    );
  });

  it('should handle other delta data', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: { custom_field: 'custom_value' },
              index: 0,
            },
          ],
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

    expect(chunks).toEqual([
      'id: 4\n',
      'event: data\n',
      `data: {"delta":{"custom_field":"custom_value"},"id":"4","index":0}\n\n`,
    ]);
  });

  it('should handle error when there is not correct error', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: { content: 'Hello' },
              index: 0,
            },
          ],
          id: '1',
        });
        controller.enqueue({
          id: '1',
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

    expect(chunks).toEqual(
      [
        'id: 1',
        'event: text',
        `data: "Hello"\n`,
        'id: 1',
        'event: error',
        `data: {"body":{"message":"chat response streaming chunk parse error, please contact your API Provider to fix it.","context":{"error":{"message":"Cannot read properties of undefined (reading '0')","name":"TypeError"},"chunk":{"id":"1"}}},"type":"StreamChunkError"}\n`,
      ].map((i) => `${i}\n`),
    );
  });

  it('should handle FIRST_CHUNK_ERROR_KEY', async () => {
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
      `data: {"body":{"errorType":"ProviderBizError","message":"Test error"},"type":"ProviderBizError"}\n\n`,
    ]);
  });

  it('should use bizErrorTypeTransformer', async () => {
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          '%FIRST_CHUNK_ERROR%: ' +
            JSON.stringify({ message: 'Custom error', name: 'CustomError' }),
        );
        controller.close();
      },
    });

    const protocolStream = OpenAIStream(mockOpenAIStream, {
      bizErrorTypeTransformer: () => AgentRuntimeErrorType.PermissionDenied,
      provider: 'grok',
    });

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: first_chunk_error\n',
      'event: error\n',
      `data: {"body":{"message":"Custom error","errorType":"PermissionDenied","provider":"grok"},"type":"PermissionDenied"}\n\n`,
    ]);
  });

  describe('Tools Calling', () => {
    it('should handle OpenAI official tool calls', async () => {
      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      function: { name: 'tool1', arguments: '{}' },
                      id: 'call_1',
                      index: 0,
                      type: 'function',
                    },
                    {
                      function: { name: 'tool2', arguments: '{}' },
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
        callbacks: {
          onToolCall: onToolCallMock,
        },
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
        `data: [{"function":{"arguments":"{}","name":"tool1"},"id":"call_1","index":0,"type":"function"},{"function":{"arguments":"{}","name":"tool2"},"id":"call_2","index":1,"type":"function"}]\n\n`,
      ]);

      expect(onToolCallMock).toHaveBeenCalledTimes(1);
    });

    it('should handle tool calls without index and type like mistral and minimax', async () => {
      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      function: { name: 'tool1', arguments: '{}' },
                      id: 'call_1',
                    },
                    {
                      function: { name: 'tool2', arguments: '{}' },
                      id: 'call_2',
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
        `data: [{"function":{"arguments":"{}","name":"tool1"},"id":"call_1","index":0,"type":"function"},{"function":{"arguments":"{}","name":"tool2"},"id":"call_2","index":1,"type":"function"}]\n\n`,
      ]);
    });

    it('should handle LiteLLM tools Calling', async () => {
      const streamData = [
        {
          id: '1',
          choices: [{ index: 0, delta: { content: '为了获取杭州的天气情况', role: 'assistant' } }],
        },
        {
          id: '1',
          choices: [{ index: 0, delta: { content: '让我为您查询一下。' } }],
        },
        {
          id: '1',
          choices: [
            {
              index: 0,
              delta: {
                content: '',
                tool_calls: [
                  {
                    id: 'toolu_01VQtK4W9kqxGGLHgsPPxiBj',
                    function: { arguments: '', name: 'realtime-weather____fetchCurrentWeather' },
                    type: 'function',
                    index: 0,
                  },
                ],
              },
            },
          ],
        },
        {
          id: '1',
          choices: [
            {
              index: 0,
              delta: {
                content: '',
                tool_calls: [
                  {
                    function: { arguments: '{"city": "\u676d\u5dde"}' },
                    type: 'function',
                    index: 0,
                  },
                ],
              },
            },
          ],
        },
        {
          id: '1',
          choices: [{ finish_reason: 'tool_calls', index: 0, delta: {} }],
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          streamData.forEach((data) => {
            controller.enqueue(data);
          });

          controller.close();
        },
      });

      const onToolCallMock = vi.fn();

      const protocolStream = OpenAIStream(mockOpenAIStream, {
        callbacks: {
          onToolCall: onToolCallMock,
        },
      });

      const decoder = new TextDecoder();
      const chunks = [];

      // @ts-ignore
      for await (const chunk of protocolStream) {
        chunks.push(decoder.decode(chunk, { stream: true }));
      }

      expect(chunks).toEqual(
        [
          'id: 1',
          'event: text',
          `data: "为了获取杭州的天气情况"\n`,
          'id: 1',
          'event: text',
          `data: "让我为您查询一下。"\n`,
          'id: 1',
          'event: tool_calls',
          `data: [{"function":{"arguments":"","name":"realtime-weather____fetchCurrentWeather"},"id":"toolu_01VQtK4W9kqxGGLHgsPPxiBj","index":0,"type":"function"}]\n`,
          'id: 1',
          'event: tool_calls',
          `data: [{"function":{"arguments":"{\\"city\\": \\"杭州\\"}","name":null},"id":"toolu_01VQtK4W9kqxGGLHgsPPxiBj","index":0,"type":"function"}]\n`,
          'id: 1',
          'event: stop',
          `data: "tool_calls"\n`,
        ].map((i) => `${i}\n`),
      );

      expect(onToolCallMock).toHaveBeenCalledTimes(2);
    });
  });
});
