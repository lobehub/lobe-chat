import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface BurnCloudModelCard {
  id: string;
}

export const LobeBurnCloudAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.burncloud.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_BURNCLOUD_CHAT_COMPLETION === '1',
  },
  models: async ({ client }: any) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: BurnCloudModelCard[] = modelsPage.data;

    return modelList.map((model: any) => ({
      id: model.id,
      object: 'model',
    }));
  },
  provider: ModelProvider.BurnCloud,
});
