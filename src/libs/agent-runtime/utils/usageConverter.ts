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
