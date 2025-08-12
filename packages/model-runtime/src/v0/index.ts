import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface V0ModelCard {
  id: string;
}

export const LobeV0AI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.v0.dev/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_V0_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: V0ModelCard[] = modelsPage.data;

    return processMultiProviderModelList(modelList);
  },
  provider: ModelProvider.V0,
});
