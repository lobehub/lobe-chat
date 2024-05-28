import { describe, expect, it } from 'vitest';

import { parseSystemAgent } from './parseSystemAgent';

describe('parseSystemAgent', () => {
  it('should parse a valid environment variable string correctly', () => {
    const envValue = 'topic=openai/gpt-3.5-turbo,translation=anthropic/claude-1';
    const expected = {
      topic: { provider: 'openai', model: 'gpt-3.5-turbo' },
      translation: { provider: 'anthropic', model: 'claude-1' },
    };

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });

  it('should handle empty environment variable string', () => {
    const envValue = '';
    const expected = {};

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });

  it('should ignore unknown keys in environment variable string', () => {
    const envValue = 'topic=openai/gpt-3.5-turbo,unknown=test/model';
    const expected = {
      topic: { provider: 'openai', model: 'gpt-3.5-turbo' },
    };

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });

  it('should throw an error for missing model or provider values', () => {
    const envValue1 = 'topic=openai,translation=/claude-1';
    const envValue2 = 'topic=/gpt-3.5-turbo,translation=anthropic/';

    expect(() => parseSystemAgent(envValue1)).toThrowError(/Missing model or provider/);
    expect(() => parseSystemAgent(envValue2)).toThrowError(/Missing model or provider/);
  });

  it('should throw an error for invalid environment variable format', () => {
    const envValue = 'topic-openai/gpt-3.5-turbo';

    expect(() => parseSystemAgent(envValue)).toThrowError(/Invalid environment variable format/);
  });

  it('should handle provider or model names with special characters', () => {
    const envValue = 'topic=openrouter/mistralai/mistral-7b-instruct:free';
    const expected = {
      topic: { provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' },
    };

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });

  it('should handle extra whitespace in environment variable string', () => {
    const envValue = '  topic = openai/gpt-3.5-turbo , translation = anthropic/claude-1 ';
    const expected = {
      topic: { provider: 'openai', model: 'gpt-3.5-turbo' },
      translation: { provider: 'anthropic', model: 'claude-1' },
    };

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });

  it('should handle full-width comma in environment variable string', () => {
    const envValue = 'topic=openai/gpt-3.5-turbo，translation=anthropic/claude-1';
    const expected = {
      topic: { provider: 'openai', model: 'gpt-3.5-turbo' },
      translation: { provider: 'anthropic', model: 'claude-1' },
    };

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });

  it('should handle extra whitespace around provider and model names', () => {
    const envValue = 'topic= openai / gpt-3.5-turbo ,translation= anthropic / claude-1 ';
    const expected = {
      topic: { provider: 'openai', model: 'gpt-3.5-turbo' },
      translation: { provider: 'anthropic', model: 'claude-1' },
    };

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });

  it('should handle an excessively long environment variable string', () => {
    const longProviderName = 'a'.repeat(100);
    const longModelName = 'b'.repeat(100);
    const envValue = `topic=${longProviderName}/${longModelName}`;
    const expected = {
      topic: { provider: longProviderName, model: longModelName },
    };

    expect(parseSystemAgent(envValue)).toEqual(expected);
  });
});
