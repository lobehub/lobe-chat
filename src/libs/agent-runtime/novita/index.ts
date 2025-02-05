import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { NovitaModelCard } from './type';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

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
  models: {
    transformModel: (m) => {
      const reasoningKeywords = [
        'deepseek-r1',
      ];

      const model = m as unknown as NovitaModelCard;

      return {
        contextWindowTokens: model.context_size,
        description: model.description,
        displayName: model.title,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall: model.description.toLowerCase().includes('function calling'),
        id: model.id,
        reasoning: model.description.toLowerCase().includes('reasoning task') || reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        vision: model.description.toLowerCase().includes('vision'),
      };
    },
  },
  provider: ModelProvider.Novita,
});
