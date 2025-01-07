import { uniqueId } from 'lodash-es';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

// import { OpenRouterModelCard } from './type';

export const LobeHigressAI = LobeOpenAICompatibleFactory({
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://chat-preview.lobehub.com',
      'X-Title': 'Lobe Chat',
      'x-Request-Id': uniqueId('lobe-chat-'),
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_HIGRESS_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const model = m as any;

      return {
        contextWindowTokens: model.context_length,
        description: model.description,
        displayName: model.name,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        functionCall:
          model.description.includes('function calling') || model.description.includes('tools'),
        id: model.id,
        maxTokens:
          typeof model.top_provider.max_completion_tokens === 'number'
            ? model.top_provider.max_completion_tokens
            : undefined,
        vision:
          model.description.includes('vision') ||
          model.description.includes('multimodal') ||
          model.id.includes('vision'),
      };
    },
  },
  provider: ModelProvider.Higress,
});
