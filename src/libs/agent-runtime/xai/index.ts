import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export interface XAIModelCard {
  id: string;
}

export const LobeXAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.x.ai/v1',
  chatCompletion: {
    // xAI API does not support stream_options: { include_usage: true }
    excludeUsage: true,
    handlePayload: (payload) => {
      const { frequency_penalty, model, presence_penalty, ...rest } = payload;

      return {
        ...rest,
        frequency_penalty: model.includes('grok-3-mini') ? undefined : frequency_penalty,
        model,
        presence_penalty: model.includes('grok-3-mini') ? undefined : presence_penalty,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_XAI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const modelsPage = (await client.models.list()) as any;
    const modelList: XAIModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall: knownModel?.abilities?.functionCall || false,
          id: model.id,
          reasoning: knownModel?.abilities?.reasoning || false,
          vision:
            model.id.toLowerCase().includes('vision') ||
            knownModel?.abilities?.functionCall ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.XAI,
});
