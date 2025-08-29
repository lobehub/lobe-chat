import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { NovitaModelCard } from './type';

export const LobeNovitaAI = createOpenAICompatibleRuntime({
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
    const modelsPage = (await client.models.list()) as any;
    const modelList: NovitaModelCard[] = modelsPage.data;

    return await processMultiProviderModelList(modelList, 'novita');
  },
  provider: ModelProvider.Novita,
});
