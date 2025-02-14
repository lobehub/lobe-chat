import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

export interface NvidiaModelCard {
  id: string;
}

export const LobeNvidiaAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_NVIDIA_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const modelsPage = await client.models.list() as any;
    const modelList: NvidiaModelCard[] = modelsPage.data;

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
            knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Nvidia,
});
