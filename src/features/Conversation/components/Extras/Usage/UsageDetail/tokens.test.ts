import { ModelUsage } from '@lobechat/types';
import { LobeDefaultAiModelListItem } from 'model-bank';
import { describe, expect, it } from 'vitest';

import { getDetailsToken } from './tokens';

describe('getDetailsToken', () => {
  // 基本测试数据
  const mockModelCard: LobeDefaultAiModelListItem = {
    pricing: {
      units: [
        { name: 'textInput', unit: 'millionTokens', strategy: 'fixed', rate: 0.01 },
        { name: 'textOutput', unit: 'millionTokens', strategy: 'fixed', rate: 0.02 },
        { name: 'textInput_cacheRead', unit: 'millionTokens', strategy: 'fixed', rate: 0.005 },
        { name: 'audioInput', unit: 'millionTokens', strategy: 'fixed', rate: 0.03 },
        { name: 'audioOutput', unit: 'millionTokens', strategy: 'fixed', rate: 0.04 },
      ],
    },
  } as LobeDefaultAiModelListItem;

  it('should return empty object when usage is empty', () => {
    const usage: ModelUsage = {};
    const result = getDetailsToken(usage);

    expect(result).toEqual({
      cachedInput: undefined,
      inputAudio: undefined,
      inputCitation: undefined,
      inputText: undefined,
      outputAudio: undefined,
      outputText: undefined,
      reasoning: undefined,
      totalOutput: undefined,
      totalTokens: undefined,
      uncachedInput: undefined,
    });
  });

  it('should handle inputTextTokens correctly', () => {
    const usage: ModelUsage = {
      inputTextTokens: 100,
    };

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.inputText).toEqual({
      credit: 1, // 100 * 0.01 = 1
      token: 100,
    });
  });

  it('should handle legacy inputTokens property', () => {
    const usage = {
      inputTokens: 100,
    } as any;

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.inputText).toEqual({
      credit: 1, // 100 * 0.01 = 1
      token: 100,
    });
  });

  it('should handle cachedTokens correctly', () => {
    const usage = {
      totalInputTokens: 200,
      cachedTokens: 50,
    } as ModelUsage;

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.inputCached).toEqual({
      credit: 1,
      token: 50,
    });

    expect(result.inputCacheMiss).toEqual({
      credit: 2, // (200 - 50) * 0.01 = 1.5, rounded to 2
      token: 150,
    });
  });

  it('should handle outputTokens correctly', () => {
    const usage = { outputTokens: 150 } as ModelUsage;

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.outputText).toEqual({
      credit: 3, // 150 * 0.02 = 3
      token: 150,
    });

    expect(result.totalOutput).toEqual({
      credit: 3,
      token: 150,
    });
  });

  it('should handle reasoningTokens correctly', () => {
    const usage = {
      outputTokens: 200,
      reasoningTokens: 50,
    } as ModelUsage;

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.outputReasoning).toEqual({
      credit: 1, // 50 * 0.02 = 1
      token: 50,
    });

    expect(result.outputText).toEqual({
      credit: 3, // (200 - 50) * 0.02 = 3
      token: 150,
    });
  });

  it('should handle audio tokens correctly', () => {
    const usage = {
      inputAudioTokens: 100,
      outputAudioTokens: 50,
      outputTokens: 150,
    } as ModelUsage;

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.inputAudio).toEqual({
      credit: 3, // 100 * 0.03 = 3
      token: 100,
    });

    expect(result.outputAudio).toEqual({
      credit: 2, // 50 * 0.04 = 2
      id: 'outputAudio',
      token: 50,
    });

    expect(result.outputText).toEqual({
      credit: 2, // (150 - 50) * 0.02 = 2
      token: 100,
    });
  });

  it('should handle outputImageTokens correctly', () => {
    const usage = {
      inputTextTokens: 100,
      outputImageTokens: 60,
      outputReasoningTokens: 30,
      totalOutputTokens: 200,
      totalTokens: 300,
    } as ModelUsage;

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.outputImage).toEqual({
      credit: 1, // 60 * 0.02 = 1.2 -> 1
      id: 'outputImage',
      token: 60,
    });

    expect(result.outputReasoning).toEqual({
      credit: 1, // 30 * 0.02 = 0.6 -> 1
      token: 30,
    });

    expect(result.outputText).toEqual({
      credit: 2, // (200 - 30 - 60) * 0.02 = 2.2 -> 2
      token: 110,
    });

    expect(result.totalOutput).toEqual({
      credit: 4, // 200 * 0.02 = 4
      token: 200,
    });

    expect(result.totalTokens).toEqual({
      credit: 4, // total credit equals totalOutputCredit here
      token: 300,
    });
  });

  it('should handle inputCitationTokens correctly', () => {
    const usage: ModelUsage = {
      inputCitationTokens: 75,
    };

    const result = getDetailsToken(usage, mockModelCard);

    expect(result.inputCitation).toEqual({
      credit: 1, // 75 * 0.01 = 0.75, rounded to 1
      token: 75,
    });
  });

  it('should handle totalTokens correctly', () => {
    const usage = {
      totalTokens: 500,
      totalInputTokens: 200,
      inputCachedTokens: 50,
      outputTokens: 300,
    } as ModelUsage;

    const result = getDetailsToken(usage, mockModelCard);

    // uncachedInput: (200 - 50) * 0.01 = 1.5 -> 2
    // cachedInput: 50 * 0.005 = 0.25 -> 1
    // totalOutput: 300 * 0.02 = 6
    // totalCredit = 2 + 1 + 6 = 9

    expect(result.totalTokens).toEqual({
      credit: 9,
      token: 500,
    });
  });

  it('should handle missing pricing information', () => {
    const usage = { inputTextTokens: 100, outputTokens: 200 } as ModelUsage;

    const result = getDetailsToken(usage);

    expect(result.inputText).toEqual({
      credit: '-',
      token: 100,
    });

    expect(result.outputText).toEqual({
      credit: '-',
      token: 200,
    });
  });

  it('should handle complex scenario with all token types', () => {
    const usage: ModelUsage = {
      totalTokens: 1000,
      totalInputTokens: 400,
      inputTextTokens: 300,
      inputAudioTokens: 50,
      inputCitationTokens: 50,
      inputCachedTokens: 100,
      totalOutputTokens: 600,
      outputAudioTokens: 100,
      outputReasoningTokens: 200,
    };

    const result = getDetailsToken(usage, mockModelCard);

    expect(result).toMatchObject({
      inputCached: {
        credit: 1, // 100 * 0.005 = 0.5, rounded to 1
        token: 100,
      },
      inputCacheMiss: {
        credit: 3, // (400 - 100) * 0.01 = 3
        token: 300,
      },
      inputText: {
        credit: 3, // 300 * 0.01 = 3
        token: 300,
      },
      inputAudio: {
        credit: 2, // 50 * 0.03 = 1.5, rounded to 2
        token: 50,
      },
      inputCitation: {
        credit: 1, // 50 * 0.01 = 0.5, rounded to 1
        token: 50,
      },
      outputAudio: {
        credit: 4, // 100 * 0.04 = 4
        id: 'outputAudio',
        token: 100,
      },
      outputReasoning: {
        credit: 4, // 200 * 0.02 = 4
        token: 200,
      },
      outputText: {
        credit: 6, // (600 - 200 - 100) * 0.02 = 6
        token: 300,
      },
      totalOutput: {
        credit: 12, // 600 * 0.02 = 12
        token: 600,
      },
      totalTokens: {
        credit: 16, // 3 + 1 + 12 = 16
        token: 1000,
      },
    });
  });
});
