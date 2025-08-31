import { openrouter as OpenRouterModels } from 'model-bank';

import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { OpenRouterModelCard, OpenRouterReasoning } from './type';

const formatPrice = (price: string) => {
  if (price === '-1') return undefined;
  return Number((Number(price) * 1e6).toPrecision(5));
};

export const LobeOpenRouterAI = createOpenAICompatibleRuntime({
  baseURL: 'https://openrouter.ai/api/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { thinking, model, max_tokens } = payload;

      let reasoning: OpenRouterReasoning = {};

      if (thinking?.type === 'enabled') {
        const modelConfig = OpenRouterModels.find((m) => m.id === model);
        const defaultMaxOutput = modelConfig?.maxOutput;

        // 配置优先级：用户设置 > 模型配置 > 硬编码默认值
        const getMaxTokens = () => {
          if (max_tokens) return max_tokens;
          if (defaultMaxOutput) return defaultMaxOutput;
          return undefined;
        };

        const maxTokens = getMaxTokens() || 32_000; // Claude Opus 4 has minimum maxOutput

        reasoning = {
          max_tokens: thinking?.budget_tokens
            ? Math.min(thinking.budget_tokens, maxTokens - 1)
            : 1024,
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
      'HTTP-Referer': 'https://lobehub.com',
      'X-Title': 'LobeHub',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENROUTER_CHAT_COMPLETION === '1',
  },
  models: async () => {
    let modelList: OpenRouterModelCard[] = [];

    try {
      const response = await fetch('https://openrouter.ai/api/frontend/models');
      if (response.ok) {
        const data = await response.json();
        modelList = data['data'];
      }
    } catch (error) {
      console.error('Failed to fetch OpenRouter frontend models:', error);
      return [];
    }

    // 处理前端获取的模型信息，转换为标准格式
    const formattedModels = modelList.map((model) => {
      const displayName = model.slug?.toLowerCase().includes('deepseek')
        ? (model.name ?? model.slug)
        : (model.short_name ?? model.name ?? model.slug);

      return {
        contextWindowTokens: model.context_length,
        description: model.description,
        displayName,
        functionCall: model.endpoint?.supports_tool_parameters || false,
        id: model.slug,
        maxOutput:
          typeof model.endpoint?.max_completion_tokens === 'number'
            ? model.endpoint.max_completion_tokens
            : undefined,
        pricing: {
          input: formatPrice(model.endpoint?.pricing?.prompt),
          output: formatPrice(model.endpoint?.pricing?.completion),
        },
        reasoning: model.endpoint?.supports_reasoning || false,
        releasedAt: new Date(model.created_at).toISOString().split('T')[0],
        vision:
          (Array.isArray(model.input_modalities) && model.input_modalities.includes('image')) ||
          false,
      };
    });

    return await processMultiProviderModelList(formattedModels, 'openrouter');
  },
  provider: ModelProvider.OpenRouter,
});
