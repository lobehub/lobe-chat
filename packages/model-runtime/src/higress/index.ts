import type { ChatModelCard } from '@lobechat/types';
import uniqueId from 'lodash-es/uniqueId';

import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface HigressModelCard {
  context_length: number;
  description: string;
  id: string;
  name: string;
  top_provider: {
    max_completion_tokens: number;
  };
}

export const LobeHigressAI = createOpenAICompatibleRuntime({
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
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('model-bank');

    const modelsPage = (await client.models.list()) as any;
    const modelList: HigressModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: model.context_length,
          description: model.description,
          displayName: model.name,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.description.includes('function calling') ||
            model.description.includes('tools') ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          maxTokens: model.top_provider.max_completion_tokens,
          reasoning:
            model.description.includes('reasoning') || knownModel?.abilities?.reasoning || false,
          vision:
            model.description.includes('vision') ||
            model.description.includes('multimodal') ||
            model.id.includes('vision') ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Higress,
});
