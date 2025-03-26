<<<<<<< HEAD
import { LobeDefaultAiModelListItem } from '@/types/aiModel';
import { ModelTokensUsage } from '@/types/message';

=======
import { ChatModelPricing, LobeDefaultAiModelListItem } from '@/types/aiModel';
import { ModelTokensUsage } from '@/types/message';

import { getPrice } from './pricing';

>>>>>>> origin/main
const calcCredit = (token: number, pricing?: number) => {
  if (!pricing) return '-';

  return parseInt((token * pricing).toFixed(0));
};

export const getDetailsToken = (
  usage: ModelTokensUsage,
  modelCard?: LobeDefaultAiModelListItem,
) => {
<<<<<<< HEAD
  const uncachedInputCredit = (
    !!usage.inputTokens
      ? calcCredit(usage.inputTokens - (usage.cachedTokens || 0), modelCard?.pricing?.input)
      : 0
  ) as number;

  const cachedInputCredit = (
    !!usage.cachedTokens ? calcCredit(usage.cachedTokens, modelCard?.pricing?.cachedInput) : 0
  ) as number;

  const totalOutput = (
    !!usage.outputTokens ? calcCredit(usage.outputTokens, modelCard?.pricing?.output) : 0
  ) as number;

  const totalTokens = uncachedInputCredit + cachedInputCredit + totalOutput;
  return {
    cachedInput: !!usage.cachedTokens
      ? {
          credit: cachedInputCredit,
          token: usage.cachedTokens,
        }
      : undefined,
=======
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

  // Pricing
  const formatPrice = getPrice(modelCard?.pricing as ChatModelPricing);

  const inputCacheMissCredit = (
    !!inputCacheMissTokens ? calcCredit(inputCacheMissTokens, formatPrice.input) : 0
  ) as number;

  const inputCachedCredit = (
    !!inputCacheTokens ? calcCredit(inputCacheTokens, formatPrice.cachedInput) : 0
  ) as number;

  const inputWriteCachedCredit = !!inputWriteCacheTokens
    ? (calcCredit(inputWriteCacheTokens, formatPrice.writeCacheInput) as number)
    : 0;

  const totalOutputCredit = (
    !!totalOutputTokens ? calcCredit(totalOutputTokens, formatPrice.output) : 0
  ) as number;
  const totalInputCredit = (
    !!totalInputTokens ? calcCredit(totalInputTokens, formatPrice.output) : 0
  ) as number;

  const totalCredit =
    inputCacheMissCredit + inputCachedCredit + inputWriteCachedCredit + totalOutputCredit;

  return {
>>>>>>> origin/main
    inputAudio: !!usage.inputAudioTokens
      ? {
          credit: calcCredit(usage.inputAudioTokens, modelCard?.pricing?.audioInput),
          token: usage.inputAudioTokens,
        }
      : undefined,
<<<<<<< HEAD
    inputText: !!usage.inputTokens
      ? {
          credit: calcCredit(
            usage.inputTokens - (usage.inputAudioTokens || 0),
            modelCard?.pricing?.input,
          ),
          token: usage.inputTokens - (usage.inputAudioTokens || 0),
        }
      : undefined,
=======
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
          credit: calcCredit(usage.inputCitationTokens, formatPrice.input),
          token: usage.inputCitationTokens,
        }
      : undefined,
    inputText: !!inputTextTokens
      ? {
          credit: calcCredit(inputTextTokens, formatPrice.input),
          token: inputTextTokens,
        }
      : undefined,

>>>>>>> origin/main
    outputAudio: !!usage.outputAudioTokens
      ? {
          credit: calcCredit(usage.outputAudioTokens, modelCard?.pricing?.audioOutput),
          id: 'outputAudio',
          token: usage.outputAudioTokens,
        }
      : undefined,
<<<<<<< HEAD

    outputText: !!usage.outputTokens
      ? {
          credit: calcCredit(
            usage.outputTokens - (usage.reasoningTokens || 0) - (usage.outputAudioTokens || 0),
            modelCard?.pricing?.output,
          ),
          token: usage.outputTokens - (usage.reasoningTokens || 0) - (usage.outputAudioTokens || 0),
        }
      : undefined,
    reasoning: !!usage.reasoningTokens
      ? {
          credit: calcCredit(usage.reasoningTokens, modelCard?.pricing?.output),
          token: usage.reasoningTokens,
        }
      : undefined,

    totalOutput: !!usage.outputTokens
      ? {
          credit: totalOutput,
          token: usage.outputTokens,
        }
      : undefined,
    totalTokens: !!usage.totalTokens
      ? {
          credit: totalTokens,
          token: usage.totalTokens,
        }
      : undefined,
    uncachedInput: !!usage.inputTokens
      ? {
          credit: uncachedInputCredit,
          token: usage.inputTokens - (usage.cachedTokens || 0),
        }
=======
    outputReasoning: !!outputReasoningTokens
      ? {
          credit: calcCredit(outputReasoningTokens, formatPrice.output),
          token: outputReasoningTokens,
        }
      : undefined,
    outputText: !!outputTextTokens
      ? {
          credit: calcCredit(outputTextTokens, formatPrice.output),
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
>>>>>>> origin/main
      : undefined,
  };
};
