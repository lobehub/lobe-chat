import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface DeepSeekModelCard {
  id: string;
}

export const LobeDeepSeekAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.deepseek.com/v1',
  chatCompletion: {
    handlePayload: ({ frequency_penalty, model, presence_penalty, temperature, top_p, ...payload }: ChatStreamPayload) =>
      ({
        ...payload,
        model,
        ...(model === 'deepseek-reasoner'
          ? {
              frequency_penalty: undefined,
              presence_penalty: undefined,
              temperature: undefined,
              top_p: undefined,
            }
          : {
              frequency_penalty,
              presence_penalty,
              temperature,
              top_p,
            }),
      }) as OpenAI.ChatCompletionCreateParamsStreaming,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const model = m as unknown as DeepSeekModelCard;

      return {
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        functionCall: !model.id.toLowerCase().includes('deepseek-reasoner'),
        id: model.id,
      };
    },
  },
  provider: ModelProvider.DeepSeek,
});
