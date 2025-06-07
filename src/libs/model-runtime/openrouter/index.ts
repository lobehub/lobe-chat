import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { OpenRouterModelCard, OpenRouterModelExtraInfo, OpenRouterReasoning } from './type';

const formatPrice = (price: string) => {
  if (price === '-1') return undefined;
  return Number((Number(price) * 1e6).toPrecision(5));
};

export const LobeOpenRouterAI = createOpenAICompatibleRuntime({
  baseURL: 'https://openrouter.ai/api/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { thinking } = payload;

      let reasoning: OpenRouterReasoning = {};
      if (thinking?.type === 'enabled') {
        reasoning = {
          max_tokens: thinking.budget_tokens,
        };
      }

      return {
        ...payload,
        model: payload.enabledSearch ? `${payload.model}:online` : payload.model,
        reasoning,
        stream: payload.stream ?? true,
      } as any;
    },
  },
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://chat-preview.lobehub.com',
      'X-Title': 'Lobe Chat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENROUTER_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: OpenRouterModelCard[] = modelsPage.data;
  
    const modelsExtraInfo: OpenRouterModelExtraInfo[] = [];
    try {
      const response = await fetch('https://openrouter.ai/api/frontend/models');
      if (response.ok) {
        const data = await response.json();
        modelsExtraInfo.push(...data['data']);
      }
    } catch (error) {
      console.error('Failed to fetch OpenRouter frontend models:', error);
    }
  
    // 解析模型能力
    const baseModels = await processMultiProviderModelList(modelList);
  
    // 合并 OpenRouter 获取的模型信息
    return baseModels.map((baseModel) => {
      const model = modelList.find(m => m.id === baseModel.id);
      const extraInfo = modelsExtraInfo.find(
        (m) => m.slug.toLowerCase() === baseModel.id.toLowerCase(),
      );
  
      if (!model) return baseModel;
  
      return {
        ...baseModel,
        contextWindowTokens: model.context_length,
        description: model.description,
        displayName: model.name,
        functionCall:
          baseModel.functionCall ||
          model.description.includes('function calling') ||
          model.description.includes('tools') ||
          extraInfo?.endpoint?.supports_tool_parameters ||
          false,
        maxTokens:
          typeof model.top_provider.max_completion_tokens === 'number'
            ? model.top_provider.max_completion_tokens
            : undefined,
        pricing: {
          input: formatPrice(model.pricing.prompt),
          output: formatPrice(model.pricing.completion),
        },
        reasoning:
          baseModel.reasoning ||
          extraInfo?.endpoint?.supports_reasoning ||
          false,
        releasedAt: new Date(model.created * 1000).toISOString().split('T')[0],
        vision:
          baseModel.vision ||
          model.architecture.modality.includes('image') ||
          false,
      };
    }).filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.OpenRouter,
});
