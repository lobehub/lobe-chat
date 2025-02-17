import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

export interface MoonshotModelCard {
  id: string;
}

export const LobeMoonshotAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.moonshot.cn/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { temperature, ...rest } = payload;

      return {
        ...rest,
        temperature: temperature !== undefined ? temperature / 2 : undefined,
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MOONSHOT_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const modelsPage = await client.models.list() as any;
    const modelList: MoonshotModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            knownModel?.abilities?.functionCall
            || false,
          id: model.id,
          reasoning:
            knownModel?.abilities?.reasoning
            || false,
          vision:
            model.id.toLowerCase().includes('vision')
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Moonshot,
});
