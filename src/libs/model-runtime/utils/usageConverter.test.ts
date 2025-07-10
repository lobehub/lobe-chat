import OpenAI from 'openai';
import { describe, expect, it } from 'vitest';

import { convertUsage } from './usageConverter';

describe('convertUsage', () => {
  it('should convert basic OpenAI usage data correctly', () => {
    // Arrange
    const openaiUsage: OpenAI.Completions.CompletionUsage = {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
    };

    // Act
    const result = convertUsage(openaiUsage);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 100,
      totalInputTokens: 100,
      totalOutputTokens: 50,
      outputTextTokens: 50,
      totalTokens: 150,
    });
  });

  it('should handle PPLX citation tokens correctly', () => {
    // Arrange
    const pplxUsage = {
      prompt_tokens: 80,
      citation_tokens: 20,
      completion_tokens: 50,
      total_tokens: 150,
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(pplxUsage);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 80,
      inputCitationTokens: 20,
      totalInputTokens: 100,
      totalOutputTokens: 50,
      outputTextTokens: 50,
      totalTokens: 170, // 150 + 20 (citation tokens)
    });
  });

  it('should handle cached tokens correctly', () => {
    // Arrange
    const usageWithCache = {
      prompt_tokens: 100,
      prompt_cache_hit_tokens: 30,
      prompt_cache_miss_tokens: 70,
      completion_tokens: 50,
      total_tokens: 150,
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(usageWithCache);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 100,
      inputCachedTokens: 30,
      inputCacheMissTokens: 70,
      totalInputTokens: 100,
      totalOutputTokens: 50,
      outputTextTokens: 50,
      totalTokens: 150,
    });
  });

  it('should handle cached tokens using prompt_tokens_details', () => {
    // Arrange
    const usageWithTokenDetails = {
      prompt_tokens: 100,
      prompt_tokens_details: {
        cached_tokens: 30,
      },
      completion_tokens: 50,
      total_tokens: 150,
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(usageWithTokenDetails);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 100,
      inputCachedTokens: 30,
      inputCacheMissTokens: 70, // 100 - 30
      totalInputTokens: 100,
      totalOutputTokens: 50,
      outputTextTokens: 50,
      totalTokens: 150,
    });
  });

  it('should handle audio tokens in input correctly', () => {
    // Arrange
    const usageWithAudioInput = {
      prompt_tokens: 100,
      prompt_tokens_details: {
        audio_tokens: 20,
      },
      completion_tokens: 50,
      total_tokens: 150,
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(usageWithAudioInput);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 100,
      inputAudioTokens: 20,
      totalInputTokens: 100,
      totalOutputTokens: 50,
      outputTextTokens: 50,
      totalTokens: 150,
    });
  });

  it('should handle detailed output tokens correctly', () => {
    // Arrange
    const usageWithOutputDetails = {
      prompt_tokens: 100,
      completion_tokens: 100,
      completion_tokens_details: {
        reasoning_tokens: 30,
        audio_tokens: 20,
      },
      total_tokens: 200,
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(usageWithOutputDetails);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 100,
      totalInputTokens: 100,
      totalOutputTokens: 100,
      outputReasoningTokens: 30,
      outputAudioTokens: 20,
      outputTextTokens: 50, // 100 - 30 - 20
      totalTokens: 200,
    });
  });

  it('should handle prediction tokens correctly', () => {
    // Arrange
    const usageWithPredictions = {
      prompt_tokens: 100,
      completion_tokens: 80,
      completion_tokens_details: {
        accepted_prediction_tokens: 30,
        rejected_prediction_tokens: 10,
      },
      total_tokens: 180,
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(usageWithPredictions);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 100,
      totalInputTokens: 100,
      totalOutputTokens: 80,
      outputTextTokens: 80,
      acceptedPredictionTokens: 30,
      rejectedPredictionTokens: 10,
      totalTokens: 180,
    });
  });

  it('should handle complex usage with all fields correctly', () => {
    // Arrange
    const complexUsage = {
      prompt_tokens: 150,
      prompt_tokens_details: {
        audio_tokens: 50,
        cached_tokens: 40,
      },
      citation_tokens: 30,
      completion_tokens: 120,
      completion_tokens_details: {
        reasoning_tokens: 40,
        audio_tokens: 30,
        accepted_prediction_tokens: 20,
        rejected_prediction_tokens: 5,
      },
      total_tokens: 300,
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(complexUsage);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 150,
      inputAudioTokens: 50,
      inputCachedTokens: 40,
      inputCacheMissTokens: 140, // 180 - 40 (totalInputTokens - cachedTokens)
      inputCitationTokens: 30,
      totalInputTokens: 180, // 150 + 30
      outputTextTokens: 50, // 120 - 40 - 30
      outputReasoningTokens: 40,
      outputAudioTokens: 30,
      totalOutputTokens: 120,
      acceptedPredictionTokens: 20,
      rejectedPredictionTokens: 5,
      totalTokens: 330, // 300 + 30 (citation_tokens)
    });
  });

  it('should omit zero or undefined values in the final output', () => {
    // Arrange
    const usageWithZeros = {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
      completion_tokens_details: {
        reasoning_tokens: 0,
        audio_tokens: undefined,
      },
    } as OpenAI.Completions.CompletionUsage;

    // Act
    const result = convertUsage(usageWithZeros);

    // Assert
    expect(result).toEqual({
      inputTextTokens: 100,
      totalInputTokens: 100,
      totalOutputTokens: 50,
      outputTextTokens: 50,
      totalTokens: 150,
    });

    // These should not be present in the result
    expect(result).not.toHaveProperty('outputReasoningTokens');
    expect(result).not.toHaveProperty('outputAudioTokens');
  });
});
