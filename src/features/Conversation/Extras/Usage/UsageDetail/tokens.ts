import { LobeDefaultAiModelListItem } from '@/types/aiModel';
import { ModelTokensUsage } from '@/types/message';

const calcCredit = (token: number, pricing?: number) => {
  if (!pricing) return 0;

  return parseInt((token * pricing).toFixed(0));
};

export const getDetailsToken = (
  usage: ModelTokensUsage,
  modelCard?: LobeDefaultAiModelListItem,
) => {
  const {
    inputTokens = 0,
    inputCacheMissTokens = 0,
    cachedTokens = 0,
    reasoningTokens = 0,
    outputAudioTokens = 0,
    inputWriteCacheTokens = 0,
    outputTokens = 0,
    totalTokens = 0,
  } = usage;

  // if there is cache miss tokens, use it. Or use input tokens - cached tokens
  const uncachedInputTokens = !!inputCacheMissTokens
    ? inputCacheMissTokens
    : inputTokens - cachedTokens;

  // calculate the credit for each part
  const uncachedInputCredit = calcCredit(uncachedInputTokens, modelCard?.pricing?.input) as number;

  const cachedInputCredit = calcCredit(cachedTokens, modelCard?.pricing?.cachedInput) as number;

  const writeCachedInputCredit = calcCredit(
    inputWriteCacheTokens,
    modelCard?.pricing?.writeCacheInput,
  ) as number;

  const totalOutputCredit = calcCredit(outputTokens, modelCard?.pricing?.output) as number;

  const totalInputCredit = uncachedInputCredit + cachedInputCredit + writeCachedInputCredit;

  const totalTokensCredit = totalInputCredit + totalOutputCredit;

  return {
    cachedInput: !!cachedTokens ? { credit: cachedInputCredit, token: cachedTokens } : undefined,
    cachedWriteInput: !!inputWriteCacheTokens
      ? { credit: writeCachedInputCredit, token: inputWriteCacheTokens }
      : undefined,

    inputAudio: !!usage.inputAudioTokens
      ? {
          credit: calcCredit(usage.inputAudioTokens, modelCard?.pricing?.audioInput),
          token: usage.inputAudioTokens,
        }
      : undefined,

    inputText: !!usage.inputTokens
      ? {
          credit: calcCredit(
            usage.inputTokens - (usage.inputAudioTokens || 0),
            modelCard?.pricing?.input,
          ),
          token: usage.inputTokens - (usage.inputAudioTokens || 0),
        }
      : undefined,

    outputAudio: !!usage.outputAudioTokens
      ? {
          credit: calcCredit(usage.outputAudioTokens, modelCard?.pricing?.audioOutput),
          id: 'outputAudio',
          token: usage.outputAudioTokens,
        }
      : undefined,

    outputReasoning: !!reasoningTokens
      ? {
          credit: calcCredit(reasoningTokens, modelCard?.pricing?.output),
          token: reasoningTokens,
        }
      : undefined,
    outputText: !!usage.outputTokens
      ? {
          credit: calcCredit(
            usage.outputTokens - reasoningTokens - outputAudioTokens,
            modelCard?.pricing?.output,
          ),
          token: usage.outputTokens - reasoningTokens - outputAudioTokens,
        }
      : undefined,

    totalInputTokens: !!inputTokens ? { credit: totalInputCredit, token: inputTokens } : undefined,
    totalOutputTokens: !!outputTokens
      ? { credit: totalOutputCredit, token: outputTokens }
      : undefined,
    totalTokens: !!totalTokens ? { credit: totalTokensCredit, token: totalTokens } : undefined,

    uncachedInput: !!uncachedInputTokens
      ? { credit: uncachedInputCredit, token: uncachedInputTokens }
      : undefined,
  };
};
