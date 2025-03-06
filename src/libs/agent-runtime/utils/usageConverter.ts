import OpenAI from 'openai';

import { ModelTokensUsage } from '@/types/message';

export const convertUsage = (usage: OpenAI.Completions.CompletionUsage): ModelTokensUsage => {
  // 目前只有 pplx 才有 citation_tokens
  const inputCitationTokens = (usage as any).citation_tokens || 0;

  const totalInputTokens = inputCitationTokens + usage.prompt_tokens;

  const totalTokens = inputCitationTokens + usage.total_tokens;

  const data = {
    acceptedPredictionTokens: usage.completion_tokens_details?.accepted_prediction_tokens,
    cachedTokens:
      (usage as any).prompt_cache_hit_tokens || usage.prompt_tokens_details?.cached_tokens,
    inputAudioTokens: usage.prompt_tokens_details?.audio_tokens,
    inputCacheMissTokens: (usage as any).prompt_cache_miss_tokens,
    inputCitationTokens: inputCitationTokens,
    inputTextTokens: usage.prompt_tokens,
    outputAudioTokens: usage.completion_tokens_details?.audio_tokens,
    outputTokens: usage.completion_tokens,
    reasoningTokens: usage.completion_tokens_details?.rejected_prediction_tokens,
    rejectedPredictionTokens: usage.completion_tokens_details?.rejected_prediction_tokens,
    totalInputTokens,
    totalTokens,
  };

  const finalData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!!value) {
      // @ts-ignore
      finalData[key] = value;
    }
  });

  return finalData;
};
