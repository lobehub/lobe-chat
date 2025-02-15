import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

export interface TencentCloudModelCard {
  id: string;
}

export const LobeTencentCloudAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.lkeap.cloud.tencent.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_TENCENT_CLOUD_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = [
      'deepseek-v3',
    ];

    const reasoningKeywords = [
      'deepseek-r1',
    ];

    const modelsPage = await client.models.list() as any;
    const modelList: TencentCloudModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
            || knownModel?.abilities?.functionCall
            || false,
          id: model.id,
          reasoning:
            reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
            || knownModel?.abilities?.reasoning
            || false,
          vision:
            knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.TencentCloud,
});
