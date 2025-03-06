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
  const inputTextToken = usage.inputTextTokens || (usage as any).inputTokens || 0;

  const totalInputToken = usage.totalInputTokens || (usage as any).inputTokens;

  const uncachedInputCredit = (
    !!totalInputToken
      ? calcCredit(totalInputToken - (usage.cachedTokens || 0), modelCard?.pricing?.input)
      : 0
  ) as number;

  const cachedInputCredit = (
    !!usage.cachedTokens ? calcCredit(usage.cachedTokens, modelCard?.pricing?.cachedInput) : 0
  ) as number;

  const totalOutput = (
    !!usage.outputTokens ? calcCredit(usage.outputTokens, modelCard?.pricing?.output) : 0
  ) as number;

  const totalCredit = uncachedInputCredit + cachedInputCredit + totalOutput;

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
    inputCitation: !!usage.inputCitationTokens
      ? {
          credit: calcCredit(usage.inputCitationTokens, modelCard?.pricing?.input),
          token: usage.inputCitationTokens,
        }
      : undefined,
    inputText: !!inputTextToken
      ? {
          credit: calcCredit(inputTextToken, modelCard?.pricing?.input),
          token: inputTextToken,
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
      ? { credit: totalCredit, token: usage.totalTokens }
      : undefined,
    uncachedInput: !!totalInputToken
      ? {
          credit: uncachedInputCredit,
          token: totalInputToken - (usage.cachedTokens || 0),
        }
      : undefined,
  };
};
