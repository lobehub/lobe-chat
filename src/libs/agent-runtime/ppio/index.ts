import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { PPIOModelCard } from './type';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export const LobePPIOAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.ppinfra.com/v3/openai',
  constructorOptions: {
    defaultHeaders: {
      'X-API-Source': 'lobechat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_PPIO_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const reasoningKeywords = [
        'deepseek-r1',
      ];

      const model = m as unknown as PPIOModelCard;

      return {
        contextWindowTokens: model.context_size,
        description: model.description,
        displayName: model.display_name?.replace("（", " (").replace("）", ")").replace("\t", "") || model.title || model.id,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall: model.description.toLowerCase().includes('function calling'),
        id: model.id,
        reasoning: model.description.toLowerCase().includes('reasoning task') || reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        vision: model.description.toLowerCase().includes('视觉'),
      };
    },
  },
  provider: ModelProvider.PPIO,
});
