import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { NovitaModelCard } from './type';

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
      const model = m as unknown as NovitaModelCard;

      return {
        contextWindowTokens: model.context_size,
        description: model.description,
        displayName: model.title,
        enabled: model.status === 1,
        functionCall: model.description.toLowerCase().includes('function calling'),
        id: model.id,
      };
    },
  },
  provider: ModelProvider.Novita,
});
