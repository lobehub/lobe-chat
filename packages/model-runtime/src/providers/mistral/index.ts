import type { ChatModelCard } from '@/types/llm';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { ModelProvider } from '../../types';

export interface MistralModelCard {
  capabilities: {
    function_calling: boolean;
    vision: boolean;
  };
  description: string;
  id: string;
  max_context_length: number;
}

export const LobeMistralAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.mistral.ai/v1',
  chatCompletion: {
    // Mistral API does not support stream_options: { include_usage: true }
    // refs: https://github.com/lobehub/lobe-chat/issues/6825
    excludeUsage: true,
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
    const { LOBE_DEFAULT_MODEL_LIST } = await import('model-bank');

    const modelsPage = (await client.models.list()) as any;
    const modelList: MistralModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: model.max_context_length,
          description: model.description,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall: model.capabilities.function_calling,
          id: model.id,
          reasoning: knownModel?.abilities?.reasoning || false,
          vision: model.capabilities.vision,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Mistral,
});
