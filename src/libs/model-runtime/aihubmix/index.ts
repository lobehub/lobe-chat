import urlJoin from 'url-join';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

import { createRouterRuntime } from '../RouterRuntime';
import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';

export interface AiHubMixModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
}

const baseURL = 'https://aihubmix.com';

export const LobeAiHubMixAI = createRouterRuntime({
  constructorOptions: {
    defaultHeaders: {
      'APP-Code': 'LobeHub',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_AIHUBMIX_CHAT_COMPLETION === '1',
  },
  id: ModelProvider.AiHubMix,
  models: async ({ client }) => {
    try {
      const modelsPage = (await client.models.list()) as any;
      const modelList: AiHubMixModelCard[] = modelsPage.data || [];

      return await processMultiProviderModelList(modelList);
    } catch (error) {
      console.warn(
        'Failed to fetch AiHubMix models. Please ensure your AiHubMix API key is valid:',
        error,
      );
      return [];
    }
  },
  routers: [
    {
      apiType: 'anthropic',
      models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
        (id) => id.startsWith('claude') || id.startsWith('kimi-k2'),
      ),
      options: { baseURL },
    },
    {
      apiType: 'google',
      models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter((id) => id.startsWith('gemini')),
      options: { baseURL: urlJoin(baseURL, '/gemini') },
    },
    {
      apiType: 'openai',
      options: { baseURL: urlJoin(baseURL, '/v1') },
    },
  ],
});
