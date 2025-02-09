import { beforeAll, describe, expect, it, vi } from 'vitest';

import { OpenRouterReasoningStream } from './openrouter';

describe('OpenRouterReasoningStream', () => {
  beforeAll(() => {
    // No-op
  });

  it('should wrap first reasoning chunk with <think> and subsequent reasoning is appended', async () => {
    // Suppose we get two reasoning-only chunks, then content
    const mockOpenAIStream = new ReadableStream({
      start(controller) {
        // Reasoning chunk #1
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                reasoning: 'Hello',
              },
              index: 0,
            },
          ],
          id: 'test-1',
        });
        // Reasoning chunk #2
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                reasoning: ', world!',
              },
              index: 1,
            },
          ],
          id: 'test-1',
        });
        // Content chunk => triggers closing </think>
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                content: 'Now real content',
              },
              index: 2,
            },
          ],
          id: 'test-1',
        });
        // Finally a stop chunk
        controller.enqueue({
          choices: [
            {
              delta: null,
              finish_reason: 'stop',
              index: 3,
            },
          ],
          id: 'test-1',
        });

        controller.close();
      },
    });

    // Mock any callbacks you want to track
    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onTokenMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = OpenRouterReasoningStream(mockOpenAIStream, {
      onStart: onStartMock,
      onText: onTextMock,
      onToken: onTokenMock,
      onCompletion: onCompletionMock,
    });

    const decoder = new TextDecoder();
    const chunks: string[] = [];

    // @ts-ignore - for-await usage on a ReadableStream in Node
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      // chunk #1: SSE lines
      'id: test-1\n',
      'event: text\n',
      'data: "<think>Hello"\n\n',

      // chunk #2: SSE lines
      'id: test-1\n',
      'event: text\n',
      'data: ", world!"\n\n',

      // chunk #3: SSE lines => content => closes out </think>
      'id: test-1\n',
      'event: text\n',
      'data: "</think>Now real content"\n\n',

      // chunk #4: SSE lines => stop
      'id: test-1\n',
      'event: stop\n',
      'data: "stop"\n\n',
    ]);

    // Verify callbacks were triggered
    expect(onStartMock).toHaveBeenCalledTimes(1); // Called once at stream start
    expect(onTextMock).toHaveBeenCalledTimes(3); // We got 3 text events
    expect(onTokenMock).toHaveBeenCalledTimes(3); // Each text is broken down into tokens if you want
    expect(onCompletionMock).toHaveBeenCalledTimes(1); // stop event => completion
  });

  it('should output content immediately if reasoning is empty or absent', async () => {
    // This simulates a chunk that only has content from the start
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                content: 'No reasoning, just content.',
              },
            },
          ],
          id: 'test-2',
        });
        controller.enqueue({
          choices: [
            {
              delta: null,
              finish_reason: 'stop',
            },
          ],
          id: 'test-2',
        });

        controller.close();
      },
    });

    const protocolStream = OpenRouterReasoningStream(mockStream);
    const decoder = new TextDecoder();
    const chunks: string[] = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    // Notice there is no <think> or </think> at all
    expect(chunks).toEqual([
      'id: test-2\n',
      'event: text\n',
      'data: "No reasoning, just content."\n\n',
      'id: test-2\n',
      'event: stop\n',
      'data: "stop"\n\n',
    ]);
  });

  it('should handle empty stream with no chunks', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    const protocolStream = OpenRouterReasoningStream(mockStream);

    const decoder = new TextDecoder();
    const chunks: string[] = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([]);
  });

  it('should handle chunk with no choices', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [],
          id: 'test-3',
        });
        controller.close();
      },
    });

    const protocolStream = OpenRouterReasoningStream(mockStream);

    const decoder = new TextDecoder();
    const chunks: string[] = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    // This means the transform function sees no choice => fallback is "data" event
    expect(chunks).toEqual([
      'id: test-3\n',
      'event: data\n',
      'data: {"choices":[],"id":"test-3"}\n\n',
    ]);
  });

  it('should handle consecutive reasoning-only chunks with no content', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                reasoning: 'Just reasoning first chunk',
              },
            },
          ],
          id: 'test-4',
        });
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                reasoning: 'Continuing reasoning second chunk',
              },
            },
          ],
          id: 'test-4',
        });
        // finish
        controller.enqueue({
          choices: [
            {
              delta: null,
              finish_reason: 'stop',
            },
          ],
          id: 'test-4',
        });
        controller.close();
      },
    });

    const protocolStream = OpenRouterReasoningStream(mockStream);
    const decoder = new TextDecoder();
    const chunks: string[] = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    // No content arrived => never closed the <think> tag
    expect(chunks).toEqual([
      'id: test-4\n',
      'event: text\n',
      'data: "<think>Just reasoning first chunk"\n\n',

      'id: test-4\n',
      'event: text\n',
      'data: "Continuing reasoning second chunk"\n\n',

      'id: test-4\n',
      'event: stop\n',
      'data: "stop"\n\n',
    ]);
  });

  it('should handle reasonings, then partial content, then more content', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        // Reasoning chunk
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                reasoning: 'I am thinking step #1...',
              },
            },
          ],
          id: 'test-5',
        });
        // Content chunk #1 => closes out <think>
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                content: 'Partial answer. ',
              },
            },
          ],
          id: 'test-5',
        });
        // Content chunk #2 => appended, no new </think>
        controller.enqueue({
          choices: [
            {
              delta: {
                role: 'assistant',
                content: 'Second part of answer.',
              },
            },
          ],
          id: 'test-5',
        });
        // Stop chunk
        controller.enqueue({
          choices: [
            {
              delta: null,
              finish_reason: 'stop',
            },
          ],
          id: 'test-5',
        });
        controller.close();
      },
    });

    const protocolStream = OpenRouterReasoningStream(mockStream);
    const decoder = new TextDecoder();
    const chunks: string[] = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    // Notice how only the first content chunk triggers "</think>"
    expect(chunks).toEqual([
      'id: test-5\n',
      'event: text\n',
      'data: "<think>I am thinking step #1..."\n\n',
      'id: test-5\n',
      'event: text\n',
      'data: "</think>Partial answer. "\n\n',
      'id: test-5\n',
      'event: text\n',
      'data: "Second part of answer."\n\n',
      'id: test-5\n',
      'event: stop\n',
      'data: "stop"\n\n',
    ]);
  });
});
