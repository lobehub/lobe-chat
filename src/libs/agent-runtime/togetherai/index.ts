import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { TogetherAIModel } from './type';

const baseURL = 'https://api.together.xyz';
export const LobeTogetherAI = LobeOpenAICompatibleFactory({
  baseURL: `${baseURL}/v1`,
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
    const apiKey = client.apiKey;
    const data = await fetch(`${baseURL}/api/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!data.ok) {
      throw new Error(`Together Fetch Error: ${data.statusText || data.status}`);
    }

    const models: TogetherAIModel[] = await data.json();

    return models
      .filter((m) => m.display_type === 'chat')
      .map((model) => {
        return {
          description: model.description,
          displayName: model.display_name,
          enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.name.endsWith(m.id))?.enabled || false,
          functionCall: model.description?.includes('function calling'),
          id: model.name,
          maxOutput: model.context_length,
          tokens: model.context_length,
          vision: model.description?.includes('vision') || model.name?.includes('vision'),
        };
      });
  },
  provider: ModelProvider.TogetherAI,
});
