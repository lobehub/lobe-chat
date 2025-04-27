import OpenAI from 'openai';

import type { ChatModelCard } from '@/types/llm';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export interface DeepSeekModelCard {
  id: string;
}

export const LobeDeepSeekAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.deepseek.com/v1',
  chatCompletion: {
    handlePayload: ({
      frequency_penalty,
      messages,
      model,
      presence_penalty,
      temperature,
      top_p,
      ...payload
    }: ChatStreamPayload) => {
      // github.com/lobehub/lobe-chat/pull/5548
      let filteredMessages = messages.filter((message) => message.role !== 'system');

      if (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
        filteredMessages.unshift({ content: '', role: 'user' });
      }

      let lastRole = '';
      for (let i = 0; i < filteredMessages.length; i++) {
        const message = filteredMessages[i];
        if (message.role === lastRole) {
          const newRole = lastRole === 'assistant' ? 'user' : 'assistant';
          filteredMessages.splice(i, 0, { content: '', role: newRole });
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
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const modelsPage = (await client.models.list()) as any;
    const modelList: DeepSeekModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            !model.id.toLowerCase().includes('reasoner') ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          reasoning:
            model.id.toLowerCase().includes('reasoner') ||
            knownModel?.abilities?.reasoning ||
            false,
          vision: knownModel?.abilities?.vision || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.DeepSeek,
});
