import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface NvidiaModelCard {
  id: string;
}

export const LobeNvidiaAI = createOpenAICompatibleRuntime({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_NVIDIA_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: NvidiaModelCard[] = modelsPage.data;

    return processMultiProviderModelList(modelList);
  },
  provider: ModelProvider.Nvidia,
});
