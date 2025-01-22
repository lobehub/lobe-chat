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
      // github.com/lobehub/lobe-chat/pull/5548
      let filteredMessages = messages.filter(message => message.role !== 'system');

      while (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
        filteredMessages.shift();
      }

      let lastRole = '';
      filteredMessages = filteredMessages.filter(message => {
        if (message.role === lastRole) {
          return false;
        }
        lastRole = message.role;
        return true;
      });

      return {
        ...payload,
        model,
        ...(model === 'deepseek-reasoner'
          ? {
              frequency_penalty: undefined,
              messages: filteredMessages,
              presence_penalty: undefined,
              temperature: undefined,
              top_p: undefined,
            }
          : {
              frequency_penalty,
              messages,
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
