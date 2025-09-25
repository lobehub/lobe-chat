import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { processMultiProviderModelList } from '../../utils/modelParse';

const THINKING_MODELS = ['deepseek-ai/deepseek-v3.1'];

export interface NvidiaModelCard {
  id: string;
}

export const LobeNvidiaAI = createOpenAICompatibleRuntime({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model, thinking, ...rest } = payload;

      const thinkingFlag =
        thinking?.type === 'enabled' ? true : thinking?.type === 'disabled' ? false : undefined;

      return {
        ...rest,
        model,
        ...(THINKING_MODELS.some((keyword) => model === keyword)
          ? {
            chat_template_kwargs: { thinking: thinkingFlag },
          }
          : {}),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_NVIDIA_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: NvidiaModelCard[] = modelsPage.data;

    return processMultiProviderModelList(modelList, 'nvidia');
  },
  provider: ModelProvider.Nvidia,
});
