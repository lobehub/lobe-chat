import { describe, expect, it, vi } from 'vitest';
import * as uuidModule from '@/utils/uuid';
import { transformAi21Stream, AWSBedrockAi21Stream } from './ai21';

// Define the BedrockAi21StreamChunk type in the test file
interface BedrockAi21StreamChunk {
  'amazon-bedrock-invocationMetrics'?: {
    inputTokenCount: number;
    outputTokenCount: number;
    invocationLatency: number;
    firstByteLatency: number;
  };
  id?: string;
  choices: {
    index?: number;
    delta: {
      content: string;
    };
    finish_reason?: string | null;
    stop_reason?: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens: number;
  };
  meta?: {
    requestDurationMillis: number;
  };
}

describe('AI21 Stream', () => {
  describe('transformAi21Stream', () => {
    it('should transform text response chunks', () => {
      const chunk: BedrockAi21StreamChunk = {
        id: "chat-ae86a1e555f04e5cbddb86cc6a98ce5e",
        choices: [{
          index: 0,
          delta: { content: "Hello world!" }
        }]
      };
      const stack = { id: 'chat_test-id' };

      const result = transformAi21Stream(chunk, stack);

      expect(result).toEqual({
        data: "Hello world!",
        id: 'chat_test-id',
        type: 'text'
      });
    });

    it('should handle stop reason with content', () => {
      const chunk: BedrockAi21StreamChunk = {
        id: "chat-ae86a1e555f04e5cbddb86cc6a98ce5e",
        choices: [{
          index: 0,
          delta: { content: "Final words." },
          finish_reason: "stop",
          stop_reason: "<|eom|>"
        }]
      };
      const stack = { id: 'chat_test-id' };

      const result = transformAi21Stream(chunk, stack);

      expect(result).toEqual({
        data: "Final words.",
        id: 'chat_test-id',
        type: 'text'
      });
    });

    it('should handle empty content', () => {
      const chunk: BedrockAi21StreamChunk = {
        id: "chat-ae86a1e555f04e5cbddb86cc6a98ce5e",
        choices: [{
          index: 0,
          delta: { content: "" }
        }]
      };
      const stack = { id: 'chat_test-id' };

      const result = transformAi21Stream(chunk, stack);

      expect(result).toEqual({
        data: "",
        id: 'chat_test-id',
        type: 'text'
      });
    });

    it('should remove amazon-bedrock-invocationMetrics', () => {
      const chunk: BedrockAi21StreamChunk = {
        id: "chat-ae86a1e555f04e5cbddb86cc6a98ce5e",
        choices: [{
          index: 0,
          delta: { content: "Hello" }
        }],
        "amazon-bedrock-invocationMetrics": {
          inputTokenCount: 63,
          outputTokenCount: 263,
          invocationLatency: 5330,
          firstByteLatency: 122
        }
      };
      const stack = { id: 'chat_test-id' };

      const result = transformAi21Stream(chunk, stack);

      expect(result).toEqual({
        data: "Hello",
        id: 'chat_test-id',
        type: 'text'
      });
      expect(chunk['amazon-bedrock-invocationMetrics']).toBeUndefined();
    });
  });

  describe('AWSBedrockAi21Stream', () => {
    it('should transform Bedrock AI21 stream to protocol stream', async () => {
      vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('test-id');
      const mockBedrockStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            id: "chat-ae86a1e555f04e5cbddb86cc6a98ce5e",
            choices: [{
              index: 0,
              delta: { content: "Hello" }
            }]
          });
          controller.enqueue({
            id: "chat-ae86a1e555f04e5cbddb86cc6a98ce5e",
            choices: [{
              index: 0,
              delta: { content: " world!" }
            }]
          });
          controller.enqueue({
            id: "chat-ae86a1e555f04e5cbddb86cc6a98ce5e",
            choices: [{
              index: 0,
              delta: { content: " Final words." },
              finish_reason: "stop",
              stop_reason: "<|eom|>"
            }]
          });
          controller.close();
        },
      });

      const onStartMock = vi.fn();
      const onTextMock = vi.fn();
      const onTokenMock = vi.fn();
      const onCompletionMock = vi.fn();

      const protocolStream = AWSBedrockAi21Stream(mockBedrockStream, {
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
        'event: text\n',
        'data: " Final words."\n\n',
      ]);

      expect(onStartMock).toHaveBeenCalledTimes(1);
      expect(onTextMock).toHaveBeenNthCalledWith(1, '"Hello"');
      expect(onTextMock).toHaveBeenNthCalledWith(2, '" world!"');
      expect(onTextMock).toHaveBeenNthCalledWith(3, '" Final words."');
      expect(onTokenMock).toHaveBeenCalledTimes(3);
      expect(onCompletionMock).toHaveBeenCalledTimes(1);
    });
  });
});
