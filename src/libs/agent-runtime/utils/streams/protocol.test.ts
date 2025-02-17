import { describe, expect, it } from 'vitest';

import { createSSEDataExtractor } from './protocol';

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
