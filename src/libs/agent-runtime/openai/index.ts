import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { pruneReasoningPayload } from '../utils/openaiHelpers';

export interface OpenAIModelCard {
  id: string;
}

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (model.startsWith('o1') || model.startsWith('o3')) {
        return pruneReasoningPayload(payload) as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = ['gpt-4', 'gpt-3.5', 'o3-mini'];

    const visionKeywords = ['gpt-4o', 'vision'];

    const reasoningKeywords = ['o1', 'o3'];

    const modelsPage = (await client.models.list()) as any;
    const modelList: OpenAIModelCard[] = modelsPage.data;

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
            (functionCallKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) &&
              !model.id.toLowerCase().includes('audio')) ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          reasoning:
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.reasoning ||
            false,
          vision:
            (visionKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) &&
              !model.id.toLowerCase().includes('audio')) ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.OpenAI,
});
