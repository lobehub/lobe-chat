import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { OpenRouterModelCard } from './type';

export const LobeOpenRouterAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://openrouter.ai/api/v1',
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://chat-preview.lobehub.com',
      'X-Title': 'Lobe Chat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENROUTER_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const visionKeywords = [
        'qwen/qvq',
        'vision',
      ];

      const reasoningKeywords = [
        'deepseek/deepseek-r1',
        'openai/o1',
        'openai/o3',
        'qwen/qvq',
        'qwen/qwq',
        'thinking'
      ];

      const model = m as unknown as OpenRouterModelCard;

      return {
        contextWindowTokens: model.context_length,
        description: model.description,
        displayName: model.name,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall:
          model.description.includes('function calling') || model.description.includes('tools'),
        id: model.id,
        maxTokens:
          typeof model.top_provider.max_completion_tokens === 'number'
            ? model.top_provider.max_completion_tokens
            : undefined,
        reasoning: reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        vision:
          model.description.includes('vision') ||
          model.description.includes('multimodal') ||
          visionKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
      };
    },
  },
  provider: ModelProvider.OpenRouter,
});
