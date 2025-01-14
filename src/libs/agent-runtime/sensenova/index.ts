import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import type { ChatModelCard } from '@/types/llm';

export interface SenseNovaModelCard {
  id: string;
}

export const LobeSenseNovaAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.sensenova.cn/compatible-mode/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { frequency_penalty, temperature, top_p, ...rest } = payload;

      return {
        ...rest,
        frequency_penalty:
          frequency_penalty !== undefined && frequency_penalty > 0 && frequency_penalty <= 2
            ? frequency_penalty
            : undefined,
        stream: true,
        temperature:
          temperature !== undefined && temperature > 0 && temperature <= 2
            ? temperature
            : undefined,
        top_p: top_p !== undefined && top_p > 0 && top_p < 1 ? top_p : undefined,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_SENSENOVA_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const functionCallKeywords = [
      'sensechat-5',
    ];

    client.baseURL = 'https://api.sensenova.cn/v1/llm';

    const modelsPage = await client.models.list() as any;
    const modelList: SenseNovaModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        return {
          enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
          functionCall: functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
          id: model.id,
          vision: model.id.toLowerCase().includes('vision'),
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.SenseNova,
});
