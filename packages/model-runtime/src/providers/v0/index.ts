import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { MODEL_LIST_CONFIGS, processModelList } from '../../utils/modelParse';

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

    return processModelList(modelList, MODEL_LIST_CONFIGS.v0, 'v0');
  },
  provider: ModelProvider.V0,
});
