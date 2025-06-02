import OpenAI from 'openai';

import { ModelTokensUsage } from '@/types/message';

export const convertUsage = (usage: OpenAI.Completions.CompletionUsage): ModelTokensUsage => {
  // 目前只有 pplx 才有 citation_tokens
  const inputTextTokens = usage.prompt_tokens || 0;
  const inputCitationTokens = (usage as any).citation_tokens || 0;
  const totalInputTokens = inputCitationTokens + inputTextTokens;

  const cachedTokens =
    (usage as any).prompt_cache_hit_tokens || usage.prompt_tokens_details?.cached_tokens;

  const inputCacheMissTokens =
    (usage as any).prompt_cache_miss_tokens || totalInputTokens - cachedTokens;

  const totalOutputTokens = usage.completion_tokens;
  const outputReasoning = usage.completion_tokens_details?.reasoning_tokens || 0;
  const outputAudioTokens = usage.completion_tokens_details?.audio_tokens || 0;
  const outputTextTokens = totalOutputTokens - outputReasoning - outputAudioTokens;

  const totalTokens = inputCitationTokens + usage.total_tokens;

  const data = {
    acceptedPredictionTokens: usage.completion_tokens_details?.accepted_prediction_tokens,
    inputAudioTokens: usage.prompt_tokens_details?.audio_tokens,
    inputCacheMissTokens: inputCacheMissTokens,
    inputCachedTokens: cachedTokens,
    inputCitationTokens: inputCitationTokens,
    inputTextTokens: inputTextTokens,
    outputAudioTokens: outputAudioTokens,
    outputReasoningTokens: outputReasoning,
    outputTextTokens: outputTextTokens,
    rejectedPredictionTokens: usage.completion_tokens_details?.rejected_prediction_tokens,
    totalInputTokens,
    totalOutputTokens: totalOutputTokens,
    totalTokens,
  } satisfies ModelTokensUsage;

  const finalData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!!value) {
      // @ts-ignore
      finalData[key] = value;
    }
  });

  return finalData;
};

export const convertResponseUsage = (usage: OpenAI.Responses.ResponseUsage): ModelTokensUsage => {
  // 1. Extract and default primary values
  const totalInputTokens = usage.input_tokens || 0;
  const inputCachedTokens = usage.input_tokens_details?.cached_tokens || 0;

  const totalOutputTokens = usage.output_tokens || 0;
  const outputReasoningTokens = usage.output_tokens_details?.reasoning_tokens || 0;

  const overallTotalTokens = usage.total_tokens || 0;

  // 2. Calculate derived values
  const inputCacheMissTokens = totalInputTokens - inputCachedTokens;

  // For ResponseUsage, inputTextTokens is effectively totalInputTokens as no further breakdown is given.
  const inputTextTokens = totalInputTokens;

  // For ResponseUsage, outputTextTokens is totalOutputTokens minus reasoning, as no audio output tokens are specified.
  const outputTextTokens = totalOutputTokens - outputReasoningTokens;

  // 3. Construct the comprehensive data object (matching ModelTokensUsage structure)
  const data = {
    // Fields from ModelTokensUsage that are not in ResponseUsage will be undefined or 0
    // and potentially filtered out later.
    acceptedPredictionTokens: undefined, // Not in ResponseUsage
    inputAudioTokens: undefined, // Not in ResponseUsage
    inputCacheMissTokens: inputCacheMissTokens,
    inputCachedTokens: inputCachedTokens,
    inputCitationTokens: undefined, // Not in ResponseUsage
    inputTextTokens: inputTextTokens,
    outputAudioTokens: undefined, // Not in ResponseUsage
    outputReasoningTokens: outputReasoningTokens,
    outputTextTokens: outputTextTokens,
    rejectedPredictionTokens: undefined, // Not in ResponseUsage
    totalInputTokens: totalInputTokens,
    totalOutputTokens: totalOutputTokens,
    totalTokens: overallTotalTokens,
  } satisfies ModelTokensUsage; // This helps ensure all keys of ModelTokensUsage are considered

  // 4. Filter out zero/falsy values, as done in the reference implementation
  const finalData: Partial<ModelTokensUsage> = {}; // Use Partial for type safety during construction
  Object.entries(data).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      (typeof value !== 'number' || value !== 0) && // A more explicit check than `!!value` if we want to be very specific about
      // keeping non-numeric truthy values, but the reference uses `!!value`.
      // `!!value` will filter out 0, which is often desired for token counts.
      // Let's stick to the reference's behavior:
      !!value
    ) {
      // @ts-ignore - We are building an object that will conform to ModelTokensUsage
      // by selectively adding properties.
      finalData[key as keyof ModelTokensUsage] = value as number;
    }
  });

  return finalData as ModelTokensUsage; // Cast because we've built it to match
};
