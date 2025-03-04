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
  console.log('usage:', usage);
  const uncachedInputCredit = !!usage.inputTokens
    ? calcCredit(usage.inputTokens - (usage.cachedTokens || 0), modelCard?.pricing?.input)
    : 0;

  const cachedInputCredit = !!usage.cachedTokens
    ? calcCredit(usage.cachedTokens, modelCard?.pricing?.cachedInput)
    : 0;

  return {
    cachedInput: !!usage.cachedTokens
      ? {
          credit: cachedInputCredit,
          token: usage.cachedTokens,
        }
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

    outputText: !!usage.completionTokens
      ? {
          credit: calcCredit(
            usage.completionTokens - (usage.reasoningTokens || 0) - (usage.outputAudioTokens || 0),
            modelCard?.pricing?.output,
          ),
          token:
            usage.completionTokens - (usage.reasoningTokens || 0) - (usage.outputAudioTokens || 0),
        }
      : undefined,
    reasoning: !!usage.reasoningTokens
      ? {
          credit: calcCredit(usage.reasoningTokens, modelCard?.pricing?.output),
          token: usage.reasoningTokens,
        }
      : undefined,

    totalOutput: !!usage.completionTokens
      ? {
          credit: calcCredit(usage.completionTokens, modelCard?.pricing?.output),
          token: usage.completionTokens,
        }
      : undefined,
    totalTokens: !!usage.totalTokens
      ? {
          credit: calcCredit(usage.totalTokens, modelCard?.pricing?.output),
          token: usage.totalTokens,
        }
      : undefined,
    uncachedInput: !!usage.inputTokens
      ? {
          credit: uncachedInputCredit,
          token: usage.inputTokens - (usage.cachedTokens || 0),
        }
      : undefined,
  };
};
