import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

export interface MistralModelCard {
  capabilities: {
    function_calling: boolean;
    vision: boolean;
  };
  description: string;
  id: string;
  max_context_length: number;
}

export const LobeMistralAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.mistral.ai/v1',
  chatCompletion: {
    handlePayload: (payload) => ({
      ...(payload.max_tokens !== undefined && { max_tokens: payload.max_tokens }),
      messages: payload.messages as any,
      model: payload.model,
      stream: true,
      temperature: payload.temperature !== undefined ? payload.temperature / 2 : undefined,
      ...(payload.tools && { tools: payload.tools }),
      top_p: payload.top_p,
    }),
    noUserId: true,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MISTRAL_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const modelsPage = await client.models.list() as any;
    const modelList: MistralModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: model.max_context_length,
          description: model.description,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall: model.capabilities.function_calling,
          id: model.id,
          reasoning:
            knownModel?.abilities?.reasoning
            || false,
          vision: model.capabilities.vision,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Mistral,
});
