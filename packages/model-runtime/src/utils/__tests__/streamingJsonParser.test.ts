import { describe, expect, it } from 'vitest';

import { StreamingJsonParser } from '../streamingJsonParser';

describe('StreamingJsonParser', () => {
  it('should parse complete JSON objects in a single chunk', () => {
    const parser = new StreamingJsonParser();
    const chunk = '{"delta":{"text":"Hello"}}{"delta":{"text":" World"}}';

    const results = parser.processChunk(chunk);

    expect(results).toEqual([{ delta: { text: 'Hello' } }, { delta: { text: ' World' } }]);
  });

  it('should handle incomplete JSON across multiple chunks', () => {
    const parser = new StreamingJsonParser();

    // First chunk with incomplete JSON
    let results = parser.processChunk('{"delta":{"text":"Hel');
    expect(results).toEqual([]);

    // Second chunk completes the JSON
    results = parser.processChunk('lo"}}');
    expect(results).toEqual([{ delta: { text: 'Hello' } }]);
  });

  it('should handle nested objects correctly', () => {
    const parser = new StreamingJsonParser();
    const chunk = '{"outer":{"inner":{"deep":"value"}}}';

    const results = parser.processChunk(chunk);

    expect(results).toEqual([{ outer: { inner: { deep: 'value' } } }]);
  });

  it('should skip malformed JSON gracefully', () => {
    const parser = new StreamingJsonParser();
    const chunk = '{invalid json}{"valid":true}';

    const results = parser.processChunk(chunk);

    expect(results).toEqual([{ valid: true }]);
  });

  it('should handle empty chunks', () => {
    const parser = new StreamingJsonParser();

    const results = parser.processChunk('');

    expect(results).toEqual([]);
  });

  it('should handle chunks with no JSON', () => {
    const parser = new StreamingJsonParser();

    const results = parser.processChunk('some random text without json');

    expect(results).toEqual([]);
  });

  it('should reset buffer correctly', () => {
    const parser = new StreamingJsonParser();

    // Add incomplete JSON
    parser.processChunk('{"incomplete":');

    // Reset and add new complete JSON
    parser.reset();
    const results = parser.processChunk('{"complete":true}');

    expect(results).toEqual([{ complete: true }]);
  });

  it('should handle mixed content with JSON objects', () => {
    const parser = new StreamingJsonParser();
    const chunk = 'prefix text {"valid":true} middle text {"another":"value"} suffix';

    const results = parser.processChunk(chunk);

    expect(results).toEqual([{ valid: true }, { another: 'value' }]);
  });
});
