import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { OpenRouterModelCard } from './type';

import type { ChatModelCard } from '@/types/llm';

export const LobeOpenRouterAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://openrouter.ai/api/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        include_reasoning: true,
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
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const visionKeywords = [
      'qwen/qvq',
      'vision'
    ];

    const reasoningKeywords = [
      'deepseek/deepseek-r1',
      'openai/o1',
      'openai/o3',
      'qwen/qvq',
      'qwen/qwq',
      'thinking',
    ];

    const modelsPage = await client.models.list() as any;
    const modelList: OpenRouterModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: model.context_length,
          description: model.description,
          displayName: model.name,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.description.includes('function calling')
            || model.description.includes('tools')
            || knownModel?.abilities?.functionCall
            || false,
          id: model.id,
          maxTokens:
            typeof model.top_provider.max_completion_tokens === 'number'
              ? model.top_provider.max_completion_tokens
              : undefined,
          reasoning:
            reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
            || knownModel?.abilities?.reasoning
            || false,
          vision:
            model.description.includes('vision')
            || model.description.includes('multimodal')
            || visionKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.OpenRouter,
});
