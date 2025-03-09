import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

export interface HunyuanModelCard {
  id: string;
}

export const LobeHunyuanAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { enabledSearch, ...rest } = payload;

      return {
        ...rest,
        stream: true,
        ...(enabledSearch && {
          citation: true,
          enable_enhancement: true,
          /*
          enable_multimedia: true,
          */
          enable_speed_search: process.env.HUNYUAN_ENABLE_SPEED_SEARCH === '1',
          search_info: true,
        }),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_HUNYUAN_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = [
      'hunyuan-functioncall',
      'hunyuan-turbo',
      'hunyuan-pro',
    ];

    const modelsPage = await client.models.list() as any;
    const modelList: HunyuanModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword)) && !model.id.toLowerCase().includes('vision')
            || knownModel?.abilities?.functionCall
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
  provider: ModelProvider.Hunyuan,
});
