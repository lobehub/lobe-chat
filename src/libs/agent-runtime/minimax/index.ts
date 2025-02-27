import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import minimaxChatModels from '@/config/aiModels/minimax';

export const getMinimaxMaxOutputs = (modelId: string): number | undefined => {
  const model = minimaxChatModels.find(model => model.id === modelId);
  return model ? model.maxOutput : undefined;
};

export const LobeMinimaxAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.minimax.chat/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { max_tokens, temperature, top_p, ...params } = payload;

      return {
        ...params,
        frequency_penalty: undefined,
        max_tokens: max_tokens !== undefined ? max_tokens : getMinimaxMaxOutputs(payload.model),
        presence_penalty: undefined,
        temperature: temperature === undefined || temperature <= 0 ? undefined : temperature / 2,
        top_p: top_p !== undefined && top_p > 0 && top_p <= 1 ? top_p : undefined,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MINIMAX_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Minimax,
});
