import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { TogetherAIModel } from './type';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import type { ChatModelCard } from '@/types/llm';

export const LobeTogetherAI = LobeOpenAICompatibleFactory({
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
    const visionKeywords = [
      'qvq',
      'vision',
    ];

    const reasoningKeywords = [
      'deepseek-r1',
      'qwq',
    ];

    client.baseURL = 'https://api.together.xyz/api';

    const modelsPage = await client.models.list() as any;
    const modelList: TogetherAIModel[] = modelsPage.body;

    return modelList
      .map((model) => {
        return {
          contextWindowTokens: LOBE_DEFAULT_MODEL_LIST.find((m) => model.name === m.id)?.contextWindowTokens ?? undefined,
          description: model.description,
          displayName: model.display_name,
          enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.name === m.id)?.enabled || false,
          functionCall: model.description?.toLowerCase().includes('function calling'),
          id: model.name,
          maxOutput: model.context_length,
          reasoning: reasoningKeywords.some(keyword => model.name.toLowerCase().includes(keyword)),
          tokens: model.context_length,
          vision: model.description?.toLowerCase().includes('vision') || visionKeywords.some(keyword => model.name?.toLowerCase().includes(keyword)),
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.TogetherAI,
});
