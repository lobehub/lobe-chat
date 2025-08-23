import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface NebiusModelCard {
    id: string;
}

export const LobeNebiusAI = createOpenAICompatibleRuntime({
    baseURL: 'https://api.studio.nebius.com/v1',
    debug: {
        chatCompletion: () => process.env.DEBUG_NEBIUS_CHAT_COMPLETION === '1',
    },
    models: async ({ client }) => {
        const modelsPage = (await client.models.list()) as any;
        const modelList: NebiusModelCard[] = modelsPage?.data || [];

        return processMultiProviderModelList(modelList, 'nebius');
    },
    provider: ModelProvider.Nebius,
});
