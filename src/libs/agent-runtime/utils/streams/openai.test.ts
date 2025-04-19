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
    const onCompletionMock = vi.fn();

    const protocolStream = OpenAIStream(mockOpenAIStream, {
      callbacks: {
        onStart: onStartMock,
        onText: onTextMock,
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
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onTextMock).toHaveBeenNthCalledWith(2, ' world!');
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
        onToolsCalling: onToolCallMock,
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

  describe('token usage', () => {
    it('should streaming token usage', async () => {
      const data = [
        {
          id: 'chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          object: 'chat.completion.chunk',
          created: 1741056525,
          model: 'gpt-4o-mini-2024-07-18',
          choices: [{ index: 0, delta: { role: 'assistant', content: '' } }],
          service_tier: 'default',
          system_fingerprint: 'fp_06737a9306',
        },
        {
          id: 'chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          object: 'chat.completion.chunk',
          created: 1741056525,
          model: 'gpt-4o-mini-2024-07-18',
          choices: [{ index: 0, delta: { content: '你好！' } }],
          service_tier: 'default',
          system_fingerprint: 'fp_06737a9306',
        },
        {
          id: 'chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          object: 'chat.completion.chunk',
          created: 1741056525,
          model: 'gpt-4o-mini-2024-07-18',
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
          service_tier: 'default',
          system_fingerprint: 'fp_06737a9306',
        },
        {
          id: 'chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          object: 'chat.completion.chunk',
          created: 1741056525,
          model: 'gpt-4o-mini-2024-07-18',
          choices: [],
          service_tier: 'default',
          system_fingerprint: 'fp_06737a9306',
          usage: {
            prompt_tokens: 1646,
            completion_tokens: 11,
            total_tokens: 1657,
            prompt_tokens_details: { audio_tokens: 0, cached_tokens: 0 },
            completion_tokens_details: {
              accepted_prediction_tokens: 0,
              audio_tokens: 0,
              reasoning_tokens: 0,
              rejected_prediction_tokens: 0,
            },
          },
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'id: chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          'event: text',
          `data: ""\n`,
          'id: chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          'event: text',
          `data: "你好！"\n`,
          'id: chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          'event: stop',
          `data: "stop"\n`,
          'id: chatcmpl-B7CcnaeK3jqWBMOhxg7SSKFwlk7dC',
          'event: usage',
          `data: {"inputCacheMissTokens":1646,"inputTextTokens":1646,"outputTextTokens":11,"totalInputTokens":1646,"totalOutputTokens":11,"totalTokens":1657}\n`,
        ].map((i) => `${i}\n`),
      );
    });

    it('should streaming litellm token usage', async () => {
      const data = [
        {
          id: 'chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          created: 1741188058,
          model: 'gpt-4o-mini',
          object: 'chat.completion.chunk',
          system_fingerprint: 'fp_06737a9306',
          choices: [{ index: 0, delta: { content: ' #' } }],
          stream_options: { include_usage: true },
        },
        {
          id: 'chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          created: 1741188068,
          model: 'gpt-4o-mini',
          object: 'chat.completion.chunk',
          system_fingerprint: 'fp_06737a9306',
          choices: [{ index: 0, delta: { content: '.' } }],
          stream_options: { include_usage: true },
        },
        {
          id: 'chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          created: 1741188068,
          model: 'gpt-4o-mini',
          object: 'chat.completion.chunk',
          system_fingerprint: 'fp_06737a9306',
          choices: [{ finish_reason: 'stop', index: 0, delta: {} }],
          stream_options: { include_usage: true },
        },
        {
          id: 'chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          created: 1741188068,
          model: 'gpt-4o-mini',
          object: 'chat.completion.chunk',
          system_fingerprint: 'fp_06737a9306',
          choices: [{ index: 0, delta: {} }],
          stream_options: { include_usage: true },
        },
        {
          id: 'chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          created: 1741188068,
          model: 'gpt-4o-mini',
          object: 'chat.completion.chunk',
          system_fingerprint: 'fp_06737a9306',
          choices: [{ index: 0, delta: {} }],
          stream_options: { include_usage: true },
          usage: {
            completion_tokens: 1720,
            prompt_tokens: 1797,
            total_tokens: 3517,
            completion_tokens_details: {
              accepted_prediction_tokens: 0,
              audio_tokens: 0,
              reasoning_tokens: 0,
              rejected_prediction_tokens: 0,
            },
            prompt_tokens_details: { audio_tokens: 0, cached_tokens: 0 },
          },
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'id: chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          'event: text',
          `data: " #"\n`,
          'id: chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          'event: text',
          `data: "."\n`,
          'id: chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          'event: stop',
          `data: "stop"\n`,
          'id: chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          'event: data',
          `data: {"delta":{},"id":"chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5","index":0}\n`,
          'id: chatcmpl-c1f6a6a6-fcf8-463a-96bf-cf634d3e98a5',
          'event: usage',
          `data: {"inputCacheMissTokens":1797,"inputTextTokens":1797,"outputTextTokens":1720,"totalInputTokens":1797,"totalOutputTokens":1720,"totalTokens":3517}\n`,
        ].map((i) => `${i}\n`),
      );
    });
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
          onToolsCalling: onToolCallMock,
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
          onToolsCalling: onToolCallMock,
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

  describe('Reasoning', () => {
    it('should handle reasoning event in official DeepSeek api', async () => {
      const data = [
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', content: null, reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: null, reasoning_content: '您好' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: null, reasoning_content: '！' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '你好', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '很高兴', reasoning_cont: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '为您', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '提供', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '帮助。', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning_content: null },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 6,
            completion_tokens: 104,
            total_tokens: 110,
            prompt_tokens_details: { cached_tokens: 0 },
            completion_tokens_details: { reasoning_tokens: 70 },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 6,
          },
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'event: reasoning',
          `data: ""\n`,
          'id: 1',
          'event: reasoning',
          `data: "您好"\n`,
          'id: 1',
          'event: reasoning',
          `data: "！"\n`,
          'id: 1',
          'event: text',
          `data: "你好"\n`,
          'id: 1',
          'event: text',
          `data: "很高兴"\n`,
          'id: 1',
          'event: text',
          `data: "为您"\n`,
          'id: 1',
          'event: text',
          `data: "提供"\n`,
          'id: 1',
          'event: text',
          `data: "帮助。"\n`,
          'id: 1',
          'event: usage',
          `data: {"inputCacheMissTokens":6,"inputTextTokens":6,"outputReasoningTokens":70,"outputTextTokens":34,"totalInputTokens":6,"totalOutputTokens":104,"totalTokens":110}\n`,
        ].map((i) => `${i}\n`),
      );
    });

    it('should handle reasoning event in aliyun bailian api', async () => {
      const data = [
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', content: '', reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning_content: '您好' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning_content: '！' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '你好', reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '很高兴', reasoning_cont: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '为您', reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '提供', reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '帮助。', reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning_content: '' },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 6,
            completion_tokens: 104,
            total_tokens: 110,
            prompt_tokens_details: { cached_tokens: 0 },
            completion_tokens_details: { reasoning_tokens: 70 },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 6,
          },
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'event: reasoning',
          `data: ""\n`,
          'id: 1',
          'event: reasoning',
          `data: "您好"\n`,
          'id: 1',
          'event: reasoning',
          `data: "！"\n`,
          'id: 1',
          'event: reasoning',
          `data: ""\n`,
          'id: 1',
          'event: text',
          `data: "你好"\n`,
          'id: 1',
          'event: text',
          `data: "很高兴"\n`,
          'id: 1',
          'event: text',
          `data: "为您"\n`,
          'id: 1',
          'event: text',
          `data: "提供"\n`,
          'id: 1',
          'event: text',
          `data: "帮助。"\n`,
          'id: 1',
          'event: usage',
          `data: {"inputCacheMissTokens":6,"inputTextTokens":6,"outputReasoningTokens":70,"outputTextTokens":34,"totalInputTokens":6,"totalOutputTokens":104,"totalTokens":110}\n`,
        ].map((i) => `${i}\n`),
      );
    });

    it('should handle reasoning in litellm', async () => {
      const data = [
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', reasoning_content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { reasoning_content: '您好' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { reasoning_content: '！' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '你好', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '很高兴', reasoning_cont: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '为您', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '提供', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '帮助。', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning_content: null },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 6,
            completion_tokens: 104,
            total_tokens: 110,
            prompt_tokens_details: { cached_tokens: 0 },
            completion_tokens_details: { reasoning_tokens: 70 },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 6,
          },
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'event: reasoning',
          `data: ""\n`,
          'id: 1',
          'event: reasoning',
          `data: "您好"\n`,
          'id: 1',
          'event: reasoning',
          `data: "！"\n`,
          'id: 1',
          'event: text',
          `data: "你好"\n`,
          'id: 1',
          'event: text',
          `data: "很高兴"\n`,
          'id: 1',
          'event: text',
          `data: "为您"\n`,
          'id: 1',
          'event: text',
          `data: "提供"\n`,
          'id: 1',
          'event: text',
          `data: "帮助。"\n`,
          'id: 1',
          'event: usage',
          `data: {"inputCacheMissTokens":6,"inputTextTokens":6,"outputReasoningTokens":70,"outputTextTokens":34,"totalInputTokens":6,"totalOutputTokens":104,"totalTokens":110}\n`,
        ].map((i) => `${i}\n`),
      );
    });

    it('should handle reasoning in siliconflow', async () => {
      const data = [
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', reasoning_content: '', content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { reasoning_content: '您好', content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { reasoning_content: '！', content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '你好', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '很高兴', reasoning_cont: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '为您', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '提供', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '帮助。', reasoning_content: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning_content: null },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 6,
            completion_tokens: 104,
            total_tokens: 110,
            prompt_tokens_details: { cached_tokens: 0 },
            completion_tokens_details: { reasoning_tokens: 70 },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 6,
          },
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'event: reasoning',
          `data: ""\n`,
          'id: 1',
          'event: reasoning',
          `data: "您好"\n`,
          'id: 1',
          'event: reasoning',
          `data: "！"\n`,
          'id: 1',
          'event: text',
          `data: "你好"\n`,
          'id: 1',
          'event: text',
          `data: "很高兴"\n`,
          'id: 1',
          'event: text',
          `data: "为您"\n`,
          'id: 1',
          'event: text',
          `data: "提供"\n`,
          'id: 1',
          'event: text',
          `data: "帮助。"\n`,
          'id: 1',
          'event: usage',
          `data: {"inputCacheMissTokens":6,"inputTextTokens":6,"outputReasoningTokens":70,"outputTextTokens":34,"totalInputTokens":6,"totalOutputTokens":104,"totalTokens":110}\n`,
        ].map((i) => `${i}\n`),
      );
    });

    it('should handle reasoning key from OpenRouter response', async () => {
      const data = [
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', reasoning: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { reasoning: '您好' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { reasoning: '！' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '你好', reasoning: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '很高兴', reasoning: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '为您', reasoning: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '提供', reasoning: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '帮助。', reasoning: null },
              logprobs: null,
              finish_reason: null,
            },
          ],
        },
        {
          id: '1',
          object: 'chat.completion.chunk',
          created: 1737563070,
          model: 'deepseek-reasoner',
          system_fingerprint: 'fp_1c5d8833bc',
          choices: [
            {
              index: 0,
              delta: { content: '', reasoning: null },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 6,
            completion_tokens: 104,
            total_tokens: 110,
            prompt_tokens_details: { cached_tokens: 0 },
            completion_tokens_details: { reasoning_tokens: 70 },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 6,
          },
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'event: reasoning',
          `data: ""\n`,
          'id: 1',
          'event: reasoning',
          `data: "您好"\n`,
          'id: 1',
          'event: reasoning',
          `data: "！"\n`,
          'id: 1',
          'event: text',
          `data: "你好"\n`,
          'id: 1',
          'event: text',
          `data: "很高兴"\n`,
          'id: 1',
          'event: text',
          `data: "为您"\n`,
          'id: 1',
          'event: text',
          `data: "提供"\n`,
          'id: 1',
          'event: text',
          `data: "帮助。"\n`,
          'id: 1',
          'event: usage',
          `data: {"inputCacheMissTokens":6,"inputTextTokens":6,"outputReasoningTokens":70,"outputTextTokens":34,"totalInputTokens":6,"totalOutputTokens":104,"totalTokens":110}\n`,
        ].map((i) => `${i}\n`),
      );
    });

    it('should handle claude reasoning in litellm openai mode', async () => {
      const data = [
        {
          id: '1',
          created: 1740505568,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [
            {
              index: 0,
              delta: {
                thinking_blocks: [
                  { type: 'thinking', thinking: '我需要找94的所有质', ignature_delta: null },
                ],
                reasoning_content: '我需要找出394的所有质',
                content: '',
                role: 'assistant',
              },
            },
          ],
          thinking_blocks: [
            { type: 'thinking', thinking: '我需要找94的所有质', signature_delta: null },
          ],
        },
        {
          id: '1',
          created: 1740505569,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [
            {
              index: 0,
              delta: {
                thinking_blocks: [
                  { type: 'thinking', thinking: '因数。\n质因数是', signature_delta: null },
                ],
                reasoning_content: '因数。\n\n质因数是',
                content: '',
              },
            },
          ],
          thinking_blocks: [
            { type: 'thinking', thinking: '因数。\n\n质因数是', signature_delta: null },
          ],
        },
        {
          id: '1',
          created: 1740505569,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [
            {
              index: 0,
              delta: {
                thinking_blocks: [
                  { type: 'thinking', thinking: '÷ 2 = 197', signature_delta: null },
                ],
                reasoning_content: '÷ 2 = 197',
                content: '',
              },
            },
          ],
          thinking_blocks: [{ type: 'thinking', thinking: '÷ 2 = 197', signature_delta: null }],
        },
        {
          id: '1',
          created: 1740505571,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [
            {
              index: 0,
              delta: {
                thinking_blocks: [
                  { type: 'thinking', thinking: '197。n394 = 2 ', signature_delta: null },
                ],
                reasoning_content: '197。\n394 = 2 ',
                content: '',
              },
            },
          ],
          thinking_blocks: [{ type: 'thinking', thinking: '\n394 = 2 ', signature_delta: null }],
        },
        {
          id: '1',
          created: 1740505571,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [
            {
              index: 0,
              delta: {
                content: '',
                tool_calls: [{ function: { arguments: '{}' }, type: 'function', index: -1 }],
              },
            },
          ],
        },
        {
          id: '1',
          created: 1740505571,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [{ index: 0, delta: { content: '要找出394的质因数，我需要将' } }],
        },
        {
          id: '1',
          created: 1740505571,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [{ index: 0, delta: { content: '394分解为质数的乘积' } }],
        },
        {
          id: '1',
          created: 1740505573,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [{ index: 0, delta: { content: '2和197。' } }],
        },
        {
          id: '1',
          created: 1740505573,
          model: 'claude-3-7-sonnet-latest',
          object: 'chat.completion.chunk',
          choices: [{ finish_reason: 'stop', index: 0, delta: {} }],
        },
      ];

      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
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
          'event: reasoning',
          `data: "我需要找出394的所有质"\n`,
          'id: 1',
          'event: reasoning',
          `data: "因数。\\n\\n质因数是"\n`,
          'id: 1',
          'event: reasoning',
          `data: "÷ 2 = 197"\n`,
          'id: 1',
          'event: reasoning',
          `data: "197。\\n394 = 2 "\n`,
          'id: 1',
          'event: text',
          `data: ""\n`,
          'id: 1',
          'event: text',
          `data: "要找出394的质因数，我需要将"\n`,
          'id: 1',
          'event: text',
          `data: "394分解为质数的乘积"\n`,
          'id: 1',
          'event: text',
          `data: "2和197。"\n`,
          'id: 1',
          'event: stop',
          `data: "stop"\n`,
        ].map((i) => `${i}\n`),
      );
    });
  });
});
