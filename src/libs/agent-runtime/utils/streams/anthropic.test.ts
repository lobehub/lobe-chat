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
    const streams = [
      {
        type: 'message_start',
        message: {
          id: 'msg_017aTuY86wNxth5TE544yqJq',
          type: 'message',
          role: 'assistant',
          model: 'claude-3-sonnet-20240229',
          content: [],
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 457, output_tokens: 1 },
        },
      },
      { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: '好' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: '的:' } },

      { type: 'content_block_stop', index: 0 },
      {
        type: 'content_block_start',
        index: 1,
        content_block: {
          type: 'tool_use',
          id: 'toolu_01WdYWxYFQ8iu5iZq1Dy9Saf',
          name: 'realtime-weather____fetchCurrentWeather',
          input: {},
        },
      },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'input_json_delta', partial_json: '' },
      },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'input_json_delta', partial_json: '{"city": "' },
      },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'input_json_delta', partial_json: '杭' },
      },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'input_json_delta', partial_json: '州"}' },
      },
      { type: 'content_block_stop', index: 1 },
      {
        type: 'message_delta',
        delta: { stop_reason: 'tool_use', stop_sequence: null },
        usage: { output_tokens: 83 },
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

    const protocolStream = AnthropicStream(mockReadableStream, {
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
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: data',
        'data: {"id":"msg_017aTuY86wNxth5TE544yqJq","type":"message","role":"assistant","model":"claude-3-sonnet-20240229","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":457,"output_tokens":1}}\n',
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: data',
        'data: ""\n',
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: text',
        'data: "好"\n',
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: text',
        'data: "的:"\n',
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: data',
        'data: {"type":"content_block_stop","index":0}\n',
        // Tool calls
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: tool_calls',
        `data: [{"function":{"arguments":"","name":"realtime-weather____fetchCurrentWeather"},"id":"toolu_01WdYWxYFQ8iu5iZq1Dy9Saf","index":0,"type":"function"}]\n`,
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: tool_calls',
        `data: [{"function":{"arguments":""},"index":0,"type":"function"}]\n`,
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: tool_calls',
        `data: [{"function":{"arguments":"{\\"city\\": \\""},"index":0,"type":"function"}]\n`,
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: tool_calls',

        `data: [{"function":{"arguments":"杭"},"index":0,"type":"function"}]\n`,
        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: tool_calls',

        `data: [{"function":{"arguments":"州\\"}"},"index":0,"type":"function"}]\n`,

        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: data',
        'data: {"type":"content_block_stop","index":1}\n',

        'id: msg_017aTuY86wNxth5TE544yqJq',
        'event: stop',
        'data: "tool_use"\n',
      ].map((item) => `${item}\n`),
    );

    expect(onToolCallMock).toHaveBeenCalledTimes(5);
  });
  it('should handle parallel tools use event and ReadableStream input', async () => {
    const streams = [
      {
        type: 'message_start',
        message: {
          id: 'msg_0175ryA67RbGrnRrGBXFQEYK',
          type: 'message',
          role: 'assistant',
          model: 'claude-3-5-sonnet-20240620',
          content: [],
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 485, output_tokens: 4 },
        },
      },
      { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: '好的,我会为您查询杭州和北京的天气情况。' },
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: '请稍等,我现在开始获取这两个城市的天气信息。' },
      },
      { type: 'content_block_stop', index: 0 },
      {
        type: 'content_block_start',
        index: 1,
        content_block: {
          type: 'tool_use',
          id: 'toolu_011NuszmBcxskstLWe4z4z5B',
          name: 'realtime-weather____fetchCurrentWeather',
          input: {},
        },
      },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'input_json_delta', partial_json: '' },
      },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'input_json_delta', partial_json: '{"city": "杭州"}' },
      },
      { type: 'content_block_stop', index: 1 },
      {
        type: 'content_block_start',
        index: 2,
        content_block: {
          type: 'tool_use',
          id: 'toolu_01HojNiibMiKnYFvLrJyfX3B',
          name: 'realtime-weather____fetchCurrentWeather',
          input: {},
        },
      },
      {
        type: 'content_block_delta',
        index: 2,
        delta: { type: 'input_json_delta', partial_json: '' },
      },
      {
        type: 'content_block_delta',
        index: 2,
        delta: { type: 'input_json_delta', partial_json: '{"city": "北京"}' },
      },
      { type: 'content_block_stop', index: 2 },
      {
        type: 'message_delta',
        delta: { stop_reason: 'tool_use', stop_sequence: null },
        usage: { output_tokens: 150 },
      },
      { type: 'message_stop' },
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

    const protocolStream = AnthropicStream(mockReadableStream, {
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
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: data',
        'data: {"id":"msg_0175ryA67RbGrnRrGBXFQEYK","type":"message","role":"assistant","model":"claude-3-5-sonnet-20240620","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":485,"output_tokens":4}}\n',
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: data',
        'data: ""\n',
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: text',
        'data: "好的,我会为您查询杭州和北京的天气情况。"\n',
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: text',
        'data: "请稍等,我现在开始获取这两个城市的天气信息。"\n',
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: data',
        'data: {"type":"content_block_stop","index":0}\n',
        // Tool calls
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: tool_calls',
        `data: [{"function":{"arguments":"","name":"realtime-weather____fetchCurrentWeather"},"id":"toolu_011NuszmBcxskstLWe4z4z5B","index":0,"type":"function"}]\n`,
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: tool_calls',
        `data: [{"function":{"arguments":""},"index":0,"type":"function"}]\n`,
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: tool_calls',
        `data: [{"function":{"arguments":"{\\"city\\": \\"杭州\\"}"},"index":0,"type":"function"}]\n`,
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: data',
        `data: {"type":"content_block_stop","index":1}\n`,
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: tool_calls',
        `data: [{"function":{"arguments":"","name":"realtime-weather____fetchCurrentWeather"},"id":"toolu_01HojNiibMiKnYFvLrJyfX3B","index":1,"type":"function"}]\n`,
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: tool_calls',
        `data: [{"function":{"arguments":""},"index":1,"type":"function"}]\n`,
        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: tool_calls',
        `data: [{"function":{"arguments":"{\\"city\\": \\"北京\\"}"},"index":1,"type":"function"}]\n`,

        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: data',
        'data: {"type":"content_block_stop","index":2}\n',

        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: stop',
        'data: "tool_use"\n',

        'id: msg_0175ryA67RbGrnRrGBXFQEYK',
        'event: stop',
        'data: "message_stop"\n',
      ].map((item) => `${item}\n`),
    );

    expect(onToolCallMock).toHaveBeenCalledTimes(6);
  });

  it('should handle thinking ', async () => {
    const streams = [
      {
        type: 'message_start',
        message: {
          id: 'msg_01MNsLe7n1uVLtu6W8rCFujD',
          type: 'message',
          role: 'assistant',
          model: 'claude-3-7-sonnet-20250219',
          content: [],
          stop_reason: null,
          stop_sequence: null,
          usage: {
            input_tokens: 46,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0,
            output_tokens: 11,
          },
        },
      },
      {
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'thinking', thinking: '', signature: '' },
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'thinking_delta', thinking: '我需要比较两个数字的' },
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'thinking_delta', thinking: '大小：9.8和9' },
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'thinking_delta', thinking: '11\n\n所以9.8比9.11大。' },
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: {
          type: 'signature_delta',
          signature:
            'EuYBCkQYAiJAHnHRJG4nPBrdTlo6CmXoyE8WYoQeoPiLnXaeuaM8ExdiIEkVvxK1DYXOz5sCubs2s/G1NsST8A003Zb8XmuhYBIMwDGMZSZ3+gxOEBpVGgzdpOlDNBTxke31SngiMKUk6WcSiA11OSVBuInNukoAhnRd5jPAEg7e5mIoz/qJwnQHV8I+heKUreP77eJdFipQaM3FHn+avEHuLa/Z/fu0O9BftDi+caB1UWDwJakNeWX1yYTvK+N1v4gRpKbj4AhctfYHMjq8qX9XTnXme5AGzCYC6HgYw2/RfalWzwNxI6k=',
        },
      },
      { type: 'content_block_stop', index: 0 },
      { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'text_delta', text: '9.8比9.11大。' },
      },
      { type: 'content_block_stop', index: 1 },
      {
        type: 'message_delta',
        delta: { stop_reason: 'end_turn', stop_sequence: null },
        usage: { output_tokens: 354 },
      },
      { type: 'message_stop' },
    ];

    const mockReadableStream = new ReadableStream({
      start(controller) {
        streams.forEach((chunk) => {
          controller.enqueue(chunk);
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

    expect(chunks).toEqual(
      [
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: data',
        'data: {"id":"msg_01MNsLe7n1uVLtu6W8rCFujD","type":"message","role":"assistant","model":"claude-3-7-sonnet-20250219","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":46,"cache_creation_input_tokens":0,"cache_read_input_tokens":0,"output_tokens":11}}\n',
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: reasoning',
        'data: ""\n',
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: reasoning',
        'data: "我需要比较两个数字的"\n',
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: reasoning',
        'data: "大小：9.8和9"\n',
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: reasoning',
        'data: "11\\n\\n所以9.8比9.11大。"\n',
        // Tool calls
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: reasoning_signature',
        `data: "EuYBCkQYAiJAHnHRJG4nPBrdTlo6CmXoyE8WYoQeoPiLnXaeuaM8ExdiIEkVvxK1DYXOz5sCubs2s/G1NsST8A003Zb8XmuhYBIMwDGMZSZ3+gxOEBpVGgzdpOlDNBTxke31SngiMKUk6WcSiA11OSVBuInNukoAhnRd5jPAEg7e5mIoz/qJwnQHV8I+heKUreP77eJdFipQaM3FHn+avEHuLa/Z/fu0O9BftDi+caB1UWDwJakNeWX1yYTvK+N1v4gRpKbj4AhctfYHMjq8qX9XTnXme5AGzCYC6HgYw2/RfalWzwNxI6k="\n`,
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: data',
        `data: {"type":"content_block_stop","index":0}\n`,
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: data',
        `data: ""\n`,
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: text',
        `data: "9.8比9.11大。"\n`,
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: data',
        `data: {"type":"content_block_stop","index":1}\n`,
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: stop',
        'data: "end_turn"\n',
        'id: msg_01MNsLe7n1uVLtu6W8rCFujD',
        'event: stop',
        'data: "message_stop"\n',
      ].map((item) => `${item}\n`),
    );
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
