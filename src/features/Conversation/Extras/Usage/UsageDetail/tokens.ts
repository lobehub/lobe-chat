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
      : undefined,
  };
};
