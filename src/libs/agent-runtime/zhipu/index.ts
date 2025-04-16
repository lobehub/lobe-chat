import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

export interface ZhipuModelCard {
  description: string;
  modelCode: string;
  modelName: string;
}

export const LobeZhipuAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  chatCompletion: {
    handlePayload: (payload) => {
      const { enabledSearch, max_tokens, model, temperature, tools, top_p, ...rest } = payload;

      const zhipuTools = enabledSearch ? [
        ...(tools || []),
        {
          type: "web_search",
          web_search: {
            enable: true,
          },
        }
      ] : tools;

      return {
        ...rest,
        max_tokens: 
          max_tokens === undefined ? undefined :
          (model.includes('glm-4v') && Math.min(max_tokens, 1024)) ||
          (model === 'glm-zero-preview' && Math.min(max_tokens, 15_300)) ||
          max_tokens,
        model,
        stream: true,
        tools: zhipuTools,
        ...(model === 'glm-4-alltools'
          ? {
              temperature:
                temperature !== undefined
                  ? Math.max(0.01, Math.min(0.99, temperature / 2))
                  : undefined,
              top_p: top_p !== undefined ? Math.max(0.01, Math.min(0.99, top_p)) : undefined,
            }
          : {
              temperature: temperature !== undefined ? temperature / 2 : undefined,
              top_p,
            }),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_ZHIPU_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const reasoningKeywords = [
      'glm-zero',
      'glm-z1',
    ];

    // ref: https://open.bigmodel.cn/console/modelcenter/square
    const url = 'https://open.bigmodel.cn/api/fine-tuning/model_center/list?pageSize=100&pageNum=1';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${client.apiKey}`,
        'Bigmodel-Organization': 'lobehub',
        'Bigmodel-Project': 'lobechat',
      },
      method: 'GET',
    });
    const json = await response.json();

    const modelList: ZhipuModelCard[] = json.rows;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.modelCode.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          description: model.description,
          displayName: model.modelName,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.modelCode.toLowerCase().includes('glm-4') && !model.modelCode.toLowerCase().includes('glm-4v')
            || knownModel?.abilities?.functionCall
            || false,
          id: model.modelCode,
          reasoning:
            reasoningKeywords.some(keyword => model.modelCode.toLowerCase().includes(keyword))
            || knownModel?.abilities?.reasoning
            || false,
          vision:
            model.modelCode.toLowerCase().includes('glm-4v')
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.ZhiPu,
});
