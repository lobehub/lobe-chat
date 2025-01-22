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
    handlePayload: ({ messages, frequency_penalty, model, presence_penalty, temperature, top_p, ...payload }: ChatStreamPayload) => {
      // Filter out system messages and remove assistant messages from the beginning until the first user message
      let filteredMessages = messages.filter(message => message.role !== 'system');
      while (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
        filteredMessages.shift();
      }

      return {
        ...payload,
        model,
        ...(model === 'deepseek-reasoner'
          ? {
              messages: filteredMessages,
              frequency_penalty: undefined,
              presence_penalty: undefined,
              temperature: undefined,
              top_p: undefined,
            }
          : {
              messages,
              frequency_penalty,
              presence_penalty,
              temperature,
              top_p,
            }),
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const model = m as unknown as DeepSeekModelCard;

      return {
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        functionCall: true,
        id: model.id,
      };
    },
  },
  provider: ModelProvider.DeepSeek,
});
