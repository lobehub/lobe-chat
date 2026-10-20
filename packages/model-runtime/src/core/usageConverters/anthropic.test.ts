import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';

import { buildAnthropicInitialUsage, convertAnthropicUsage } from './anthropic';

describe('convertAnthropicUsage', () => {
  it('preserves an explicit zero cache read without inventing a missing value', () => {
    const usage = { input_tokens: 100, output_tokens: 10 } as Anthropic.Messages.Usage;
    expect(buildAnthropicInitialUsage(usage)?.inputCachedTokens).toBeUndefined();
    expect(
      buildAnthropicInitialUsage({ ...usage, cache_read_input_tokens: 0 })?.inputCachedTokens,
    ).toBe(0);
  });
  it('should convert message_start usage with cache information', () => {
    const event = {
      type: 'message_start',
      message: {
        id: 'msg_1',
        usage: {
          cache_creation_input_tokens: 20,
          cache_read_input_tokens: 10,
          input_tokens: 100,
          output_tokens: 5,
        },
      },
    } as unknown as Anthropic.MessageStreamEvent;

    const usage = convertAnthropicUsage(event);

    expect(usage).toEqual({
      inputCacheMissTokens: 100,
      inputCachedTokens: 10,
      inputWriteCacheTokens: 20,
      totalInputTokens: 130,
      totalOutputTokens: 5,
      totalTokens: 135,
    });
  });

  it('should accumulate output tokens on message_delta', () => {
    const previousUsage = {
      inputCacheMissTokens: 100,
      inputCachedTokens: 10,
      inputWriteCacheTokens: 20,
      totalInputTokens: 130,
      totalOutputTokens: 5,
    };

    const deltaEvent = {
      type: 'message_delta',
      delta: {
        stop_reason: 'end_turn',
      },
      usage: {
        output_tokens: 8,
      },
    } as unknown as Anthropic.MessageStreamEvent;

    const usage = convertAnthropicUsage(deltaEvent, previousUsage);

    expect(usage).toEqual({
      inputCacheMissTokens: 100,
      inputCachedTokens: 10,
      inputWriteCacheTokens: 20,
      totalInputTokens: 130,
      totalOutputTokens: 13,
      totalTokens: 143,
    });
  });

  it('should keep previous usage when delta has no tokens', () => {
    const previousUsage = {
      totalInputTokens: 50,
      totalOutputTokens: 2,
    };

    const deltaEvent = {
      type: 'message_delta',
      delta: {
        stop_reason: 'end_turn',
      },
      usage: null,
    } as unknown as Anthropic.MessageStreamEvent;

    const usage = convertAnthropicUsage(deltaEvent, previousUsage);

    expect(usage).toEqual({
      totalInputTokens: 50,
      totalOutputTokens: 2,
      totalTokens: 52,
    });
  });

  it('should return undefined when delta has no usage and no context', () => {
    const deltaEvent = {
      type: 'message_delta',
      delta: {
        stop_reason: 'end_turn',
      },
      usage: null,
    } as unknown as Anthropic.MessageStreamEvent;

    const usage = convertAnthropicUsage(deltaEvent);

    expect(usage).toBeUndefined();
  });
});

describe('cache_creation split', () => {
  it('carries the per-TTL cache-write split into usage', () => {
    const event = {
      type: 'message_start',
      message: {
        id: 'msg_2',
        usage: {
          cache_creation: {
            ephemeral_1h_input_tokens: 15,
            ephemeral_5m_input_tokens: 5,
          },
          cache_creation_input_tokens: 20,
          cache_read_input_tokens: 10,
          input_tokens: 100,
          output_tokens: 5,
        },
      },
    } as unknown as Anthropic.MessageStreamEvent;

    const usage = convertAnthropicUsage(event);

    expect(usage).toMatchObject({
      inputWriteCacheTokens: 20,
      inputWriteCacheTokens1h: 15,
      inputWriteCacheTokens5m: 5,
    });
  });

  it('omits zero split buckets', () => {
    const event = {
      type: 'message_start',
      message: {
        id: 'msg_3',
        usage: {
          cache_creation: {
            ephemeral_1h_input_tokens: 0,
            ephemeral_5m_input_tokens: 20,
          },
          cache_creation_input_tokens: 20,
          cache_read_input_tokens: 0,
          input_tokens: 100,
          output_tokens: 5,
        },
      },
    } as unknown as Anthropic.MessageStreamEvent;

    const usage = convertAnthropicUsage(event);

    expect(usage?.inputWriteCacheTokens5m).toBe(20);
    expect(usage?.inputWriteCacheTokens1h).toBeUndefined();
  });
});
