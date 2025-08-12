import urlJoin from 'url-join';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import { responsesAPIModels } from '@/const/models';

import { createRouterRuntime } from '../RouterRuntime';
import { ModelProvider } from '../types';
import { ChatStreamPayload } from '../types/chat';
import { detectModelProvider, processMultiProviderModelList } from '../utils/modelParse';

export interface AiHubMixModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
}

const baseURL = 'https://aihubmix.com';

const handlePayload = (payload: ChatStreamPayload) => {
  if (
    responsesAPIModels.has(payload.model) ||
    payload.model.includes('gpt-') ||
    /^o\d/.test(payload.model)
  ) {
    return { ...payload, apiMode: 'responses' } as any;
  }
  return payload as any;
};

export const LobeAiHubMixAI = createRouterRuntime({
  debug: {
    chatCompletion: () => process.env.DEBUG_AIHUBMIX_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'APP-Code': 'LobeHub',
  },
  id: ModelProvider.AiHubMix,
  models: async ({ client }) => {
    try {
      const modelsPage = (await client.models.list()) as any;
      const modelList: AiHubMixModelCard[] = modelsPage.data || [];

      return await processMultiProviderModelList(modelList, 'aihubmix');
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
        (id) => detectModelProvider(id) === 'anthropic',
      ),
      options: { baseURL },
    },
    {
      apiType: 'google',
      models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
        (id) => detectModelProvider(id) === 'google',
      ),
      options: { baseURL: urlJoin(baseURL, '/gemini') },
    },
    {
      apiType: 'openai',
      options: {
        baseURL: urlJoin(baseURL, '/v1'),
        chatCompletion: {
          handlePayload,
        },
      },
    },
  ],
});
