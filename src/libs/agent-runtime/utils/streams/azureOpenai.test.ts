import { describe, expect, it, vi } from 'vitest';

import { AzureOpenAIStream } from './azureOpenai';

describe('AzureOpenAIStream', () => {
  it('should transform AzureOpenAI stream to protocol stream', async () => {
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
              finishReason: 'stop',
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

    const protocolStream = AzureOpenAIStream(mockOpenAIStream, {
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

    const protocolStream = AzureOpenAIStream(mockStream);

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

    const protocolStream = AzureOpenAIStream(mockOpenAIStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(['id: 3\n', 'event: data\n', `data: {"content":null}\n\n`]);
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

    const protocolStream = AzureOpenAIStream(mockOpenAIStream);

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

  describe('tool Calling', () => {
    it('should handle tool calls', async () => {
      const streams = [
        {
          id: 'chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:14.698Z',
          choices: [
            {
              delta: {
                content: null,
                role: 'assistant',
                toolCalls: [
                  {
                    function: { arguments: '', name: 'realtime-weather____fetchCurrentWeather' },
                    id: 'call_1GT6no85IuAal06XHH2CZe8Q',
                    index: 0,
                    type: 'function',
                  },
                ],
              },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:14.698Z',
          choices: [
            {
              delta: { toolCalls: [{ function: { arguments: '{"' }, index: 0 }] },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:14.698Z',
          choices: [
            {
              delta: { toolCalls: [{ function: { arguments: 'city' }, index: 0 }] },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:14.698Z',
          choices: [
            {
              delta: { toolCalls: [{ function: { arguments: '":"' }, index: 0 }] },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:14.698Z',
          choices: [
            {
              delta: { toolCalls: [{ function: { arguments: '杭州' }, index: 0 }] },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilteesults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:14.698Z',
          choices: [
            {
              delta: { toolCalls: [{ function: { arguments: '"}' }, index: 0 }] },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:14.698Z',
          choices: [
            {
              delta: {},
              index: 0,
              logprobs: null,
              finishReason: 'tool_calls',
              contentFilterResults: {},
            },
          ],
        },
      ];

      const mockReadableStream = new ReadableStream({
        start(controller) {
          streams.forEach((chunk) => {
            controller.enqueue(chunk);
          });
          controller.close();
        },
      });

      const onToolCallMock = vi.fn();

      const protocolStream = AzureOpenAIStream(mockReadableStream, {
        onToolCall: onToolCallMock,
      });

      const decoder = new TextDecoder();
      const chunks = [];

      // @ts-ignore
      for await (const chunk of protocolStream) {
        chunks.push(decoder.decode(chunk, { stream: true }));
      }

      expect(chunks).toEqual(
        [
          'id: chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          'event: tool_calls',
          `data: [{"function":{"arguments":"","name":"realtime-weather____fetchCurrentWeather"},"id":"call_1GT6no85IuAal06XHH2CZe8Q","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          'event: tool_calls',
          `data: [{"function":{"arguments":"{\\""},"id":"call_1GT6no85IuAal06XHH2CZe8Q","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          'event: tool_calls',
          `data: [{"function":{"arguments":"city"},"id":"call_1GT6no85IuAal06XHH2CZe8Q","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          'event: tool_calls',
          `data: [{"function":{"arguments":"\\":\\""},"id":"call_1GT6no85IuAal06XHH2CZe8Q","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          'event: tool_calls',
          `data: [{"function":{"arguments":"杭州"},"id":"call_1GT6no85IuAal06XHH2CZe8Q","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          'event: tool_calls',
          `data: [{"function":{"arguments":"\\"}"},"id":"call_1GT6no85IuAal06XHH2CZe8Q","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEBuv3ra8l4KKQhGj6ldhqfwV4Iy',
          'event: stop',
          `data: "tool_calls"\n`,
        ].map((item) => `${item}\n`),
      );

      expect(onToolCallMock).toHaveBeenCalledTimes(6);
    });
    it('should handle parallel tools calling', async () => {
      const streams = [
        {
          id: 'chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:16.635Z',
          choices: [
            {
              delta: {
                toolCalls: [
                  {
                    function: { arguments: '', name: 'realtime-weather____fetchCurrentWeather' },
                    id: 'call_cnQ80VjcWCS69wWKp4jz0nJd',
                    index: 0,
                    type: 'function',
                  },
                ],
              },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:16.635Z',
          choices: [
            {
              delta: { toolCalls: [{ function: { arguments: '{"city": "杭州"}' }, index: 0 }] },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:16.635Z',
          choices: [
            {
              delta: {
                toolCalls: [
                  {
                    function: { arguments: '', name: 'realtime-weather____fetchCurrentWeather' },
                    id: 'call_LHrpPTrT563QkP9chVddzXQk',
                    index: 1,
                    type: 'function',
                  },
                ],
              },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:16.635Z',
          choices: [
            {
              delta: { toolCalls: [{ function: { arguments: '{"city": "北京"}' }, index: 1 }] },
              index: 0,
              logprobs: null,
              finishReason: null,
              contentFilterResults: {},
            },
          ],
        },
        {
          id: 'chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          model: 'gpt-4o-2024-05-13',
          object: 'chat.completion.chunk',
          systemFingerprint: 'fp_abc28019ad',
          created: '1970-01-20T21:36:16.635Z',
          choices: [
            {
              delta: {},
              index: 0,
              logprobs: null,
              finishReason: 'tool_calls',
              contentFilterResults: {},
            },
          ],
        },
      ];

      const mockReadableStream = new ReadableStream({
        start(controller) {
          streams.forEach((chunk) => {
            controller.enqueue(chunk);
          });
          controller.close();
        },
      });

      const onToolCallMock = vi.fn();

      const protocolStream = AzureOpenAIStream(mockReadableStream, {
        onToolCall: onToolCallMock,
      });

      const decoder = new TextDecoder();
      const chunks = [];

      // @ts-ignore
      for await (const chunk of protocolStream) {
        chunks.push(decoder.decode(chunk, { stream: true }));
      }

      expect(chunks).toEqual(
        [
          'id: chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          'event: tool_calls',
          `data: [{"function":{"arguments":"","name":"realtime-weather____fetchCurrentWeather"},"id":"call_cnQ80VjcWCS69wWKp4jz0nJd","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          'event: tool_calls',
          `data: [{"function":{"arguments":"{\\"city\\": \\"杭州\\"}"},"id":"call_cnQ80VjcWCS69wWKp4jz0nJd","index":0,"type":"function"}]\n`,
          'id: chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          'event: tool_calls',
          `data: [{"function":{"arguments":"","name":"realtime-weather____fetchCurrentWeather"},"id":"call_LHrpPTrT563QkP9chVddzXQk","index":1,"type":"function"}]\n`,
          'id: chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          'event: tool_calls',
          `data: [{"function":{"arguments":"{\\"city\\": \\"北京\\"}"},"id":"call_LHrpPTrT563QkP9chVddzXQk","index":1,"type":"function"}]\n`,
          'id: chatcmpl-9eEh9DtpidX5CyE4GcyIeyhU3pLir',
          'event: stop',
          `data: "tool_calls"\n`,
        ].map((item) => `${item}\n`),
      );

      expect(onToolCallMock).toHaveBeenCalledTimes(4);
    });
    it('should handle tool calls without index and type', async () => {
      const mockOpenAIStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            choices: [
              {
                delta: {
                  toolCalls: [
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

      const protocolStream = AzureOpenAIStream(mockOpenAIStream);

      const decoder = new TextDecoder();
      const chunks = [];

      // @ts-ignore
      for await (const chunk of protocolStream) {
        chunks.push(decoder.decode(chunk, { stream: true }));
      }

      expect(chunks).toEqual([
        'id: 5\n',
        'event: tool_calls\n',
        `data: [{"function":{"name":"tool1","arguments":"{}"},"id":"call_1","index":0,"type":"function"},{"function":{"name":"tool2","arguments":"{}"},"id":"call_2","index":1,"type":"function"}]\n\n`,
      ]);
    });
  });
});
