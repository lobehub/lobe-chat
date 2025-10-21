import { ModelProvider } from 'model-bank';

import {
  type OpenAICompatibleFactoryOptions,
  createOpenAICompatibleRuntime,
} from '../../core/openaiCompatibleFactory';
import { MODEL_LIST_CONFIGS, processModelList } from '../../utils/modelParse';
import type { ChatStreamPayload } from '../../types';

export interface DeepSeekModelCard {
  id: string;
}

export const params = {
  baseURL: 'https://api.deepseek.com/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { tools, ...rest } = payload;
      // DeepSeek API doesn't accept empty tools array, so omit it if empty
      if (tools && tools.length === 0) {
        return rest;
      }
      return payload;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION === '1',
  },
  // Deepseek don't support json format well
  // use Tools calling to simulate
  generateObject: {
    useToolsCalling: true,
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
      // DeepSeek API doesn't accept empty tools array, so omit it if empty
      if (tools && tools.length === 0) {
        return rest;
      }
      return payload;
    },
  },
} satisfies OpenAICompatibleFactoryOptions;

export const LobeDeepSeekAI = createOpenAICompatibleRuntime(params);
