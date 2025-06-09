import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { NovitaModelCard } from './type';

export const LobeNovitaAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.novita.ai/v3/openai',
  constructorOptions: {
    defaultHeaders: {
      'X-Novita-Source': 'lobechat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_NOVITA_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const reasoningKeywords = ['deepseek-r1'];

    const modelsPage = (await client.models.list()) as any;
    const modelList: NovitaModelCard[] = modelsPage.data;

    // 解析模型能力
    const baseModels = await processMultiProviderModelList(modelList);

    // 合并 Novita 获取的模型信息
    return baseModels
      .map((baseModel) => {
        const model = modelList.find((m) => m.id === baseModel.id);

        if (!model) return baseModel;

        return {
          ...baseModel,
          contextWindowTokens: model.context_size,
          description: model.description,
          displayName: model.title,
          functionCall:
            baseModel.functionCall ||
            model.description.toLowerCase().includes('function calling') ||
            false,
          reasoning:
            baseModel.reasoning ||
            model.description.toLowerCase().includes('reasoning task') ||
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            false,
          vision: baseModel.vision || model.description.toLowerCase().includes('vision') || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Novita,
});
