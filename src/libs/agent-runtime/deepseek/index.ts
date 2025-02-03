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
    handlePayload: ({ frequency_penalty, messages, model, presence_penalty, temperature, top_p, ...payload }: ChatStreamPayload) => {
      // github.com/lobehub/lobe-chat/pull/5548
      let filteredMessages = messages.filter(message => message.role !== 'system');

      if (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
        filteredMessages.unshift({ content: "", role: "user" });
      }

      let lastRole = '';
      for (let i = 0; i < filteredMessages.length; i++) {
        const message = filteredMessages[i];
        if (message.role === lastRole) {
          const newRole = lastRole === 'assistant' ? 'user' : 'assistant';
          filteredMessages.splice(i, 0, { content: "", role: newRole });
          i++;
        }
        lastRole = message.role;
      }

      if (messages.length > 0 && messages[0].role === 'system') {
        filteredMessages.unshift(messages[0]);
      }

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
        functionCall: !model.id.toLowerCase().includes('deepseek-reasoner'),
        id: model.id,
      };
    },
  },
  provider: ModelProvider.DeepSeek,
});
