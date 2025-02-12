import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

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
  models: {
    transformModel: (m) => {
      const model = m as unknown as MistralModelCard;

      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id);

      return {
        contextWindowTokens: model.max_context_length,
        description: model.description,
        displayName: knownModel?.displayName ?? undefined,
        enabled: knownModel?.enabled || false,
        functionCall: model.capabilities.function_calling,
        id: model.id,
        vision: model.capabilities.vision,
      };
    },
  },
  provider: ModelProvider.Mistral,
});
