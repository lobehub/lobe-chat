import { ChatResponse } from 'ollama/browser';
import { describe, expect, it, vi } from 'vitest';

import * as uuidModule from '@/utils/uuid';

import { OllamaStream } from './ollama';

describe('OllamaStream', () => {
  it('should transform Ollama stream to protocol stream', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const mockOllamaStream: AsyncIterable<ChatResponse> = {
      // @ts-ignore
      async *[Symbol.asyncIterator]() {
        yield { message: { content: 'Hello' }, done: false };
        yield { message: { content: ' world!' }, done: false };
        yield { message: { content: '' }, done: true };
      },
    };

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onTokenMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = OllamaStream(mockOllamaStream, {
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
      'id: chat_1\n',
      'event: text\n',
      `data: "Hello"\n\n`,
      'id: chat_1\n',
      'event: text\n',
      `data: " world!"\n\n`,
      'id: chat_1\n',
      'event: stop\n',
      `data: "finished"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, '"Hello"');
    expect(onTextMock).toHaveBeenNthCalledWith(2, '" world!"');
    expect(onTokenMock).toHaveBeenCalledTimes(2);
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('should handle empty stream', async () => {
    const mockOllamaStream = {
      async *[Symbol.asyncIterator]() {},
    };

    const protocolStream = OllamaStream(mockOllamaStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([]);
  });
});
