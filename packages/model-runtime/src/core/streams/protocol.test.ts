import { describe, expect, it } from 'vitest';

import { createSSEDataExtractor, createTokenSpeedCalculator, createSSEProtocolTransformer } from './protocol';

describe('createSSEDataExtractor', () => {
  // Helper function to convert string to Uint8Array
  const stringToUint8Array = (str: string): Uint8Array => {
    return new TextEncoder().encode(str);
  };

  // Helper function to process chunks through transformer
  const processChunk = async (transformer: TransformStream, chunk: Uint8Array) => {
    const results: any[] = [];
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(chunk);
        controller.close();
      },
    });

    const writable = new WritableStream({
      write(chunk) {
        results.push(chunk);
      },
    });

    await readable.pipeThrough(transformer).pipeTo(writable);

    return results;
  };

  it('should correctly transform single SSE data line', async () => {
    const transformer = createSSEDataExtractor();
    const input = 'data: {"message": "hello"}\n';
    const chunk = stringToUint8Array(input);

    const results = await processChunk(transformer, chunk);

    expect(results).toEqual([{ message: 'hello' }]);
  });

  it('should handle multiple SSE data lines', async () => {
    const transformer = createSSEDataExtractor();
    const input = `data: {"message": "hello"}\ndata: {"message": "world"}\n`;
    const chunk = stringToUint8Array(input);

    const results = await processChunk(transformer, chunk);

    expect(results).toEqual([{ message: 'hello' }, { message: 'world' }]);
  });

  it('should ignore non-data lines', async () => {
    const transformer = createSSEDataExtractor();
    const input = `id: 1\ndata: {"message": "hello"}\nevent: message\n`;
    const chunk = stringToUint8Array(input);

    const results = await processChunk(transformer, chunk);

    expect(results).toEqual([{ message: 'hello' }]);
  });

  it('should skip [DONE] heartbeat messages', async () => {
    const transformer = createSSEDataExtractor();
    const input = `data: {"message": "hello"}\ndata: [DONE]\ndata: {"message": "world"}\n`;
    const chunk = stringToUint8Array(input);

    const results = await processChunk(transformer, chunk);

    expect(results).toEqual([{ message: 'hello' }, { message: 'world' }]);
  });

  it('should handle invalid JSON gracefully', async () => {
    const transformer = createSSEDataExtractor();
    const input = `data: {"message": "hello"}\ndata: invalid-json\ndata: {"message": "world"}\n`;
    const chunk = stringToUint8Array(input);

    const results = await processChunk(transformer, chunk);

    expect(results).toEqual([{ message: 'hello' }, { message: 'world' }]);
  });

  it('should handle empty data lines', async () => {
    const transformer = createSSEDataExtractor();
    const input = `data: \ndata: {"message": "hello"}\ndata: \n`;
    const chunk = stringToUint8Array(input);

    const results = await processChunk(transformer, chunk);

    expect(results).toEqual([{ message: 'hello' }]);
  });

  it('should process large chunks of data correctly', async () => {
    const transformer = createSSEDataExtractor();
    const messages = Array(100)
      .fill(null)
      .map((_, i) => `data: {"message": "message${i}"}\n`)
      .join('');
    const chunk = stringToUint8Array(messages);

    const results = await processChunk(transformer, chunk);

    expect(results).toHaveLength(100);
    expect(results[0]).toEqual({ message: 'message0' });
    expect(results[99]).toEqual({ message: 'message99' });
  });

  describe('real world data', () => {
    it('should convert azure ai data', async () => {
      const chunks = [
        `data: {"choices":[{"delta":{"content":"","reasoning_content":null,"role":"assistant","tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714651,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"\u003cthink\u003e","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714651,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"\n\n","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714651,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"\u003c/think\u003e","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714651,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"\n\n","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714651,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"Hello","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714651,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"!","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":" How","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":" can","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":" I","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":" assist","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":" you","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":" today","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"?","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":" ","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"😊","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":null,"index":0,"logprobs":null,"matched_stop":null}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[{"delta":{"content":"","reasoning_content":null,"role":null,"tool_calls":null},"finish_reason":"stop","index":0,"logprobs":null,"matched_stop":1}],"created":1739714652,"id":"1392a93d52c3483ea872d0ab2aaff7d7","model":"DeepSeek-R1","object":"chat.completion.chunk","usage":null}\n`,
        `data: {"choices":[],"id":"79fca0de792a4ffb8ec836442a2a42c0","model":"DeepSeek-R1","usage":{"completion_tokens":16,"prompt_tokens":4,"total_tokens":20}}\n`,
        `data: [DONE]`,
      ];

      const transformer = createSSEDataExtractor();

      const results = await processChunk(transformer, stringToUint8Array(chunks.join('')));
      expect(results).matchSnapshot();
    });
  });
});

describe('createTokenSpeedCalculator', async () => {
  // Mock the param from caller - 1000 to avoid div 0
  const inputStartAt = Date.now() - 1000;

  // Helper function to process chunks through transformer
  const processChunk = async (transformer: TransformStream, chunk: any) => {
    const results: any[] = [];
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(chunk);
        controller.close();
      },
    });

    const writable = new WritableStream({
      write(chunk) {
        results.push(chunk);
      },
    });

    await readable.pipeThrough(transformer).pipeTo(writable);

    return results;
  };

  it('should calculate token speed correctly', async () => {
    const chunks = [
      { data: '', id: 'chatcmpl-BKO1bogylHvMaYfETjTAzrCguYwZy', type: 'text' },
      { data: 'hi', id: 'chatcmpl-BKO1bogylHvMaYfETjTAzrCguYwZy', type: 'text' },
      { data: 'stop', id: 'chatcmpl-BKO1bogylHvMaYfETjTAzrCguYwZy', type: 'stop' },
      {
        data: {
          inputTextTokens: 9,
          outputTextTokens: 1,
          totalInputTokens: 9,
          totalOutputTokens: 1,
          totalTokens: 10,
        },
        id: 'chatcmpl-BKO1bogylHvMaYfETjTAzrCguYwZy',
        type: 'usage',
      },
    ];

    const transformer = createTokenSpeedCalculator((v) => v, { inputStartAt });
    const results = await processChunk(transformer, chunks);
    expect(results).toHaveLength(chunks.length + 1);
    const speedChunk = results.slice(-1)[0];
    expect(speedChunk.id).toBe('output_speed');
    expect(speedChunk.type).toBe('speed');
    expect(speedChunk.data.tps).not.toBeNaN();
    expect(speedChunk.data.ttft).not.toBeNaN();
  });

  it('should not calculate token speed if no usage', async () => {
    const chunks = [
      { data: '', id: 'chatcmpl-BKO1bogylHvMaYfETjTAzrCguYwZy', type: 'text' },
      { data: 'hi', id: 'chatcmpl-BKO1bogylHvMaYfETjTAzrCguYwZy', type: 'text' },
      { data: 'stop', id: 'chatcmpl-BKO1bogylHvMaYfETjTAzrCguYwZy', type: 'stop' },
    ];

    const transformer = createTokenSpeedCalculator((v) => v, { inputStartAt });
    const results = await processChunk(transformer, chunks);
    expect(results).toHaveLength(chunks.length);
  });

  it('should calculate token speed considering outputImageTokens when totalOutputTokens is missing', async () => {
    const chunks = [
      { data: '', id: 'chatcmpl-image-1', type: 'text' },
      { data: 'hi', id: 'chatcmpl-image-1', type: 'text' },
      { data: 'stop', id: 'chatcmpl-image-1', type: 'stop' },
      {
        data: {
          inputTextTokens: 9,
          outputTextTokens: 1,
          outputImageTokens: 4,
          totalInputTokens: 9,
          // totalOutputTokens intentionally omitted to force summation path
          totalTokens: 13,
        },
        id: 'chatcmpl-image-1',
        type: 'usage',
      },
    ];

    const transformer = createTokenSpeedCalculator((v) => v, { inputStartAt });
    const results = await processChunk(transformer, chunks);

    // should push an extra speed chunk
    expect(results).toHaveLength(chunks.length + 1);
    const speedChunk = results.slice(-1)[0];
    expect(speedChunk.id).toBe('output_speed');
    expect(speedChunk.type).toBe('speed');
    // tps and ttft should be numeric (avoid flakiness if interval is 0ms)
    expect(speedChunk.data.tps).not.toBeNaN();
    expect(speedChunk.data.ttft).not.toBeNaN();
  });
});

describe('createSSEProtocolTransformer', () => {
  const processChunk = async (transformer: TransformStream, chunk: any) => {
    const results: any[] = [];
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(chunk);
        controller.close();
      },
    });

    const writable = new WritableStream({
      write(chunk) {
        results.push(chunk);
      },
    });

    await readable.pipeThrough(transformer).pipeTo(writable);

    return results;
  };

  it('should convert chunk into SSE formatted lines without enforcing terminal (default)', async () => {
    const transformerFn = (chunk: any) => ({ type: 'text', id: chunk.id, data: chunk.data });
  const transformer = createSSEProtocolTransformer(transformerFn as any);

    const input = { id: '1', data: 'hello' };
    const results = await processChunk(transformer, input);

    // Should only output the text event, no injected error on flush (default not enforced)
    expect(results).toEqual([
      `id: 1\n`,
      `event: text\n`,
      `data: ${JSON.stringify('hello')}\n\n`,
    ]);
  });

  it('should not emit flush error if a terminal event was received (enforced)', async () => {
    const transformerFn = (chunk: any) => ({ type: 'stop', id: chunk.id, data: chunk.data });
  const transformer = createSSEProtocolTransformer(transformerFn as any, { id: 'stream_ok' }, { requireTerminalEvent: true });

    const input = { id: 'ok', data: 'bye' };
    const results = await processChunk(transformer, input);

    // Only the stop event lines should be present (no extra error event from flush)
    expect(results).toEqual([
      `id: ok\n`,
      `event: stop\n`,
      `data: ${JSON.stringify('bye')}\n\n`,
    ]);
  });

  it('should emit an error event on flush when no terminal event received (enforced)', async () => {
    const transformerFn = (chunk: any) => ({ type: 'text', id: chunk.id, data: chunk.data });
    const streamStack = { id: 'stream_missing_term' } as any;
  const transformer = createSSEProtocolTransformer(transformerFn as any, streamStack, { requireTerminalEvent: true });

    const input = { id: '1', data: 'partial' };
    const results = await processChunk(transformer, input);

    // original 3 lines + 3 lines from flush error
    expect(results).toHaveLength(6);

    // last three lines should be the injected error event
    const lastThree = results.slice(-3);
    const expectedData = {
      body: { name: 'Stream parsing error', reason: 'unexpected_end' },
      message: 'Stream ended unexpectedly',
      name: 'Stream parsing error',
      type: 'StreamChunkError',
    };

    expect(lastThree).toEqual([
      `id: ${streamStack.id}\n`,
      `event: error\n`,
      `data: ${JSON.stringify(expectedData)}\n\n`,
    ]);
  });
});
