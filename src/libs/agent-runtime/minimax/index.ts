import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import Minimax from '@/config/modelProviders/minimax';

export const getMinimaxMaxOutputs = (modelId: string): number | undefined => {
  const model = Minimax.chatModels.find(model => model.id === modelId);
  return model ? model.maxOutput : undefined;
};

export const LobeMinimaxAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.minimax.chat/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { temperature, top_p, ...params } = payload;

      return {
        ...params,
        frequency_penalty: undefined,
        max_tokens: payload.max_tokens !== undefined ? payload.max_tokens : getMinimaxMaxOutputs(payload.model),
        presence_penalty: undefined,
        stream: true,
        temperature: temperature === undefined || temperature <= 0 ? undefined : temperature / 2,
        tools: params.tools?.map((tool) => ({
          function: {
            description: tool.function.description,
            name: tool.function.name,
            parameters: JSON.stringify(tool.function.parameters),
          },
          type: 'function',
        })),
        top_p: top_p !== undefined && top_p > 0 && top_p <= 1 ? top_p : undefined,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MINIMAX_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Minimax,
});
