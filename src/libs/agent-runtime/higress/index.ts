import { uniqueId } from 'lodash-es';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

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

      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id);

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
          model.description.includes('reasoning')
          || knownModel?.abilities?.reasoning
          || false,
        vision:
          model.description.includes('vision')
          || model.description.includes('multimodal')
          || model.id.includes('vision')
          || knownModel?.abilities?.vision
          || false,
      };
    },
  },
  provider: ModelProvider.Higress,
});
