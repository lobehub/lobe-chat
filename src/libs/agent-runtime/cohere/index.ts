import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

export interface CohereModelCard {
  context_length: number;
  features: string[] | null;
  name: string;
  supports_vision: boolean;
}

export const LobeCohereAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.cohere.ai/compatibility/v1',
  chatCompletion: {
    // https://docs.cohere.com/v2/docs/compatibility-api#unsupported-parameters
    excludeUsage: true,
    handlePayload: (payload) => {
      const { frequency_penalty, presence_penalty, top_p, ...rest } = payload;

      return {
        ...rest,
        frequency_penalty: frequency_penalty !== undefined ? Math.max(0, Math.min(1, frequency_penalty / 2)) : undefined,
        presence_penalty: presence_penalty !== undefined ? Math.max(0, Math.min(1, presence_penalty / 2)) : undefined,
        top_p: top_p !== undefined ? Math.max(0.01, Math.min(0.99, top_p)) : undefined,
      } as any;
    },
    noUserId: true,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_COHERE_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    client.baseURL = 'https://api.cohere.com/v1';

    const modelsPage = await client.models.list() as any;
    const modelList: CohereModelCard[] = modelsPage.body.models;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.name.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: model.context_length,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            (model.features && model.features.includes("tools"))
            || knownModel?.abilities?.functionCall
            || false,
          id: model.name,
          vision:
            model.supports_vision
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Cohere,
});
