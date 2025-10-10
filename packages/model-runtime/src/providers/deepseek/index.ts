import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { ChatStreamPayload } from '../../types';
import { MODEL_LIST_CONFIGS, processModelList } from '../../utils/modelParse';

export interface DeepSeekModelCard {
  id: string;
}

export const LobeDeepSeekAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.deepseek.com/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { tools, ...rest } = payload;
      
      // DeepSeek API doesn't accept empty tools arrays, only omit tools if empty
      return {
        ...rest,
        stream: payload.stream ?? true,
        ...(tools && tools.length > 0 ? { tools } : {}),
      };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: DeepSeekModelCard[] = modelsPage.data;

    return processModelList(modelList, MODEL_LIST_CONFIGS.deepseek, 'deepseek');
  },
  provider: ModelProvider.DeepSeek,
  responses: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { tools, ...rest } = payload;
      
      // DeepSeek API doesn't accept empty tools arrays, only omit tools if empty
      return {
        ...rest,
        ...(tools && tools.length > 0 ? { tools } : {}),
      };
    },
  },
});
