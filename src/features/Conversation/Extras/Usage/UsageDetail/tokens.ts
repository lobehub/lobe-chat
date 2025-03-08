import { LobeDefaultAiModelListItem } from '@/types/aiModel';
import { ModelTokensUsage } from '@/types/message';

const calcCredit = (token: number, pricing?: number) => {
  if (!pricing) return '-';

  return parseInt((token * pricing).toFixed(0));
};

export const getDetailsToken = (
  usage: ModelTokensUsage,
  modelCard?: LobeDefaultAiModelListItem,
) => {
  const inputTextTokens = usage.inputTextTokens || (usage as any).inputTokens || 0;
  const totalInputTokens = usage.totalInputTokens || (usage as any).inputTokens || 0;

  const totalOutputTokens = usage.totalOutputTokens || (usage as any).outputTokens || 0;

  const outputReasoningTokens = usage.outputReasoningTokens || (usage as any).reasoningTokens || 0;

  const outputTextTokens = usage.outputTextTokens
    ? usage.outputTextTokens
    : totalOutputTokens - outputReasoningTokens - (usage.outputAudioTokens || 0);

  const inputWriteCacheTokens = usage.inputWriteCacheTokens || 0;
  const inputCacheTokens = usage.inputCachedTokens || (usage as any).cachedTokens || 0;

  const inputCacheMissTokens = usage?.inputCacheMissTokens
    ? usage?.inputCacheMissTokens
    : totalInputTokens - (inputCacheTokens || 0);

  const inputCacheMissCredit = (
    !!inputCacheMissTokens ? calcCredit(inputCacheMissTokens, modelCard?.pricing?.input) : 0
  ) as number;

  const inputCachedCredit = (
    !!inputCacheTokens ? calcCredit(inputCacheTokens, modelCard?.pricing?.cachedInput) : 0
  ) as number;

  const inputWriteCachedCredit = !!inputWriteCacheTokens
    ? (calcCredit(inputWriteCacheTokens, modelCard?.pricing?.writeCacheInput) as number)
    : 0;

  const totalOutputCredit = (
    !!totalOutputTokens ? calcCredit(totalOutputTokens, modelCard?.pricing?.output) : 0
  ) as number;
  const totalInputCredit = (
    !!totalInputTokens ? calcCredit(totalInputTokens, modelCard?.pricing?.output) : 0
  ) as number;

  const totalCredit =
    inputCacheMissCredit + inputCachedCredit + inputWriteCachedCredit + totalOutputCredit;

  return {
    inputAudio: !!usage.inputAudioTokens
      ? {
          credit: calcCredit(usage.inputAudioTokens, modelCard?.pricing?.audioInput),
          token: usage.inputAudioTokens,
        }
      : undefined,
    inputCacheMiss: !!inputCacheMissTokens
      ? { credit: inputCacheMissCredit, token: inputCacheMissTokens }
      : undefined,
    inputCached: !!inputCacheTokens
      ? { credit: inputCachedCredit, token: inputCacheTokens }
      : undefined,
    inputCachedWrite: !!inputWriteCacheTokens
      ? { credit: inputWriteCachedCredit, token: inputWriteCacheTokens }
      : undefined,
    inputCitation: !!usage.inputCitationTokens
      ? {
          credit: calcCredit(usage.inputCitationTokens, modelCard?.pricing?.input),
          token: usage.inputCitationTokens,
        }
      : undefined,
    inputText: !!inputTextTokens
      ? {
          credit: calcCredit(inputTextTokens, modelCard?.pricing?.input),
          token: inputTextTokens,
        }
      : undefined,

    outputAudio: !!usage.outputAudioTokens
      ? {
          credit: calcCredit(usage.outputAudioTokens, modelCard?.pricing?.audioOutput),
          id: 'outputAudio',
          token: usage.outputAudioTokens,
        }
      : undefined,
    outputReasoning: !!outputReasoningTokens
      ? {
          credit: calcCredit(outputReasoningTokens, modelCard?.pricing?.output),
          token: outputReasoningTokens,
        }
      : undefined,
    outputText: !!outputTextTokens
      ? {
          credit: calcCredit(outputTextTokens, modelCard?.pricing?.output),
          token: outputTextTokens,
        }
      : undefined,

    totalInput: !!totalInputTokens
      ? { credit: totalInputCredit, token: totalInputTokens }
      : undefined,
    totalOutput: !!totalOutputTokens
      ? { credit: totalOutputCredit, token: totalOutputTokens }
      : undefined,
    totalTokens: !!usage.totalTokens
      ? { credit: totalCredit, token: usage.totalTokens }
      : undefined,
  };
};
