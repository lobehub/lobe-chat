import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { NovitaModelCard } from './type';

import type { ChatModelCard } from '@/types/llm';

export const LobeNovitaAI = LobeOpenAICompatibleFactory({
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
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const reasoningKeywords = [
      'deepseek-r1',
    ];

    const modelsPage = await client.models.list() as any;
    const modelList: NovitaModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: model.context_size,
          description: model.description,
          displayName: model.title,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.description.toLowerCase().includes('function calling')
            || knownModel?.abilities?.functionCall
            || false,
          id: model.id,
          reasoning:
            model.description.toLowerCase().includes('reasoning task')
            || reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
            || knownModel?.abilities?.reasoning
            || false,
          vision:
            model.description.toLowerCase().includes('vision')
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Novita,
});
