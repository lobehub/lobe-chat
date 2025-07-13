import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { TogetherAIModel } from './type';

export const LobeTogetherAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.together.xyz/v1',
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://chat-preview.lobehub.com',
      'X-Title': 'Lobe Chat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_TOGETHERAI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const visionKeywords = ['qvq', 'vision'];

    const reasoningKeywords = ['deepseek-r1', 'qwq'];

    client.baseURL = 'https://api.together.xyz/api';

    const modelsPage = (await client.models.list()) as any;
    const modelList: TogetherAIModel[] = modelsPage.body;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          description: model.description,
          displayName: model.display_name,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.description?.toLowerCase().includes('function calling') ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          maxOutput: model.context_length,
          reasoning:
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.functionCall ||
            false,
          tokens: model.context_length,
          vision:
            model.description?.toLowerCase().includes('vision') ||
            visionKeywords.some((keyword) => model.id?.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.functionCall ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.TogetherAI,
});
