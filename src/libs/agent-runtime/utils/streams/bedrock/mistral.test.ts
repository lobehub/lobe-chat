import { describe, expect, it, vi } from 'vitest';
import * as uuidModule from '@/utils/uuid';
import { transformMistralStream, AWSBedrockMistralStream } from './mistral';

// Define the BedrockMistralStreamChunk type in the test file
interface BedrockMistralStreamChunk {
  'amazon-bedrock-invocationMetrics'?: {
    inputTokenCount: number;
    outputTokenCount: number;
    invocationLatency: number;
    firstByteLatency: number;
  };
  choices: {
    index?: number;
    message: {
      content: string;
      role?: string;
      tool_call_id?: string;
      tool_calls?: {
        function: any;
        id?: string;
        index?: number;
        type?: string;
      }[];
    };
    stop_reason?: string | null;
  }[];
}

describe('Mistral Stream', () => {
  describe('transformMistralStream', () => {
    it('should transform text response chunks', () => {
      const chunk: BedrockMistralStreamChunk = {
        choices: [{
          index: 0,
          message: { role: "assistant", content: "Hello world!" }
        }]
      };
      const stack = { id: 'chat_test-id' };

      const result = transformMistralStream(chunk, stack);

      expect(result).toEqual({
        data: "Hello world!",
        id: 'chat_test-id',
        type: 'text'
      });
    });

    it('should transform tool call chunks', () => {
      const chunk: BedrockMistralStreamChunk = {
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{
              id: "3NcHNntdRyaHu8zisKJAhQ",
              function: {
                name: "realtime-weather____fetchCurrentWeather",
                arguments: '{"city": "Singapore"}'
              }
            }]
          }
        }]
      };
      const stack = { id: 'chat_test-id' };

      const result = transformMistralStream(chunk, stack);

      expect(result).toEqual({
        data: [{
          function: {
            name: "realtime-weather____fetchCurrentWeather",
            arguments: '{"city": "Singapore"}'
          },
          id: "3NcHNntdRyaHu8zisKJAhQ",
          index: 0,
          type: 'function'
        }],
        id: 'chat_test-id',
        type: 'tool_calls'
      });
    });

    it('should handle stop reason', () => {
      const chunk: BedrockMistralStreamChunk = {
        choices: [{
          index: 0,
          message: { role: "assistant", content: "" },
          stop_reason: "stop"
        }]
      };
      const stack = { id: 'chat_test-id' };

      const result = transformMistralStream(chunk, stack);

      expect(result).toEqual({
        data: "stop",
        id: 'chat_test-id',
        type: 'stop'
      });
    });

    it('should handle empty content', () => {
      const chunk: BedrockMistralStreamChunk = {
        choices: [{
          index: 0,
          message: { role: "assistant", content: "" }
        }]
      };
      const stack = { id: 'chat_test-id' };

      const result = transformMistralStream(chunk, stack);

      expect(result).toEqual({
        data: "",
        id: 'chat_test-id',
        type: 'text'
      });
    });

    it('should remove amazon-bedrock-invocationMetrics', () => {
      const chunk: BedrockMistralStreamChunk = {
        choices: [{
          index: 0,
          message: { role: "assistant", content: "Hello" }
        }],
        "amazon-bedrock-invocationMetrics": {
          inputTokenCount: 63,
          outputTokenCount: 263,
          invocationLatency: 5330,
          firstByteLatency: 122
        }
      };
      const stack = { id: 'chat_test-id' };

      const result = transformMistralStream(chunk, stack);

      expect(result).toEqual({
        data: "Hello",
        id: 'chat_test-id',
        type: 'text'
      });
      expect(chunk['amazon-bedrock-invocationMetrics']).toBeUndefined();
    });
  });

  describe('AWSBedrockMistralStream', () => {
    it('should transform Bedrock Mistral stream to protocol stream', async () => {
      vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('test-id');
      const mockBedrockStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            choices: [{
              index: 0,
              message: { role: "assistant", content: "Hello" }
            }]
          });
          controller.enqueue({
            choices: [{
              index: 0,
              message: { role: "assistant", content: " world!" }
            }]
          });
          controller.enqueue({
            choices: [{
              index: 0,
              message: { role: "assistant", content: "" },
              stop_reason: "stop"
            }]
          });
          controller.close();
        },
      });

      const onStartMock = vi.fn();
      const onTextMock = vi.fn();
      const onTokenMock = vi.fn();
      const onCompletionMock = vi.fn();

      const protocolStream = AWSBedrockMistralStream(mockBedrockStream, {
        onStart: onStartMock,
        onText: onTextMock,
        onToken: onTokenMock,
        onCompletion: onCompletionMock,
      });

      const decoder = new TextDecoder();
      const chunks: string[] = [];

      for await (const chunk of protocolStream as unknown as AsyncIterable<Uint8Array>) {
        chunks.push(decoder.decode(chunk, { stream: true }));
      }

      expect(chunks).toEqual([
        'id: chat_test-id\n',
        'event: text\n',
        'data: "Hello"\n\n',
        'id: chat_test-id\n',
        'event: text\n',
        'data: " world!"\n\n',
        'id: chat_test-id\n',
        'event: stop\n',
        'data: "stop"\n\n',
      ]);

      expect(onStartMock).toHaveBeenCalledTimes(1);
      expect(onTextMock).toHaveBeenNthCalledWith(1, '"Hello"');
      expect(onTextMock).toHaveBeenNthCalledWith(2, '" world!"');
      expect(onTokenMock).toHaveBeenCalledTimes(2);
      expect(onCompletionMock).toHaveBeenCalledTimes(1);
    });
  });
});
