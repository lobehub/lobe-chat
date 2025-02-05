import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import type { ChatModelCard } from '@/types/llm';

export interface ZhipuModelCard {
  description: string;
  modelCode: string;
  modelName: string;
}

export const LobeZhipuAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  chatCompletion: {
    handlePayload: ({ model, temperature, top_p, ...payload }: ChatStreamPayload) =>
      ({
        ...payload,
        model,
        stream: true,
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
      }) as OpenAI.ChatCompletionCreateParamsStreaming,
  },
  constructorOptions: {
    defaultHeaders: {
      'Bigmodel-Organization': 'lobehub',
      'Bigmodel-project': 'lobechat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_ZHIPU_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    // ref: https://open.bigmodel.cn/console/modelcenter/square
    client.baseURL = 'https://open.bigmodel.cn/api/fine-tuning/model_center/list?pageSize=100&pageNum=1';

    const modelsPage = await client.models.list() as any;
    const modelList: ZhipuModelCard[] = modelsPage.body.rows;

    return modelList
      .map((model) => {
        return {
          contextWindowTokens: LOBE_DEFAULT_MODEL_LIST.find((m) => model.modelCode === m.id)?.contextWindowTokens ?? undefined,
          description: model.description,
          displayName: model.modelName,
          enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.modelCode === m.id)?.enabled || false,
          functionCall: model.modelCode.toLowerCase().includes('glm-4') && !model.modelCode.toLowerCase().includes('glm-4v'),
          id: model.modelCode,
          reasoning: model.modelCode.toLowerCase().includes('glm-zero-preview'),
          vision: model.modelCode.toLowerCase().includes('glm-4v'),
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.ZhiPu,
});
