import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { MODEL_LIST_CONFIGS, processModelList } from '../utils/modelParse';

export interface VolcengineModelCard {
  id: string;
}

export const LobeVolcengineAI = createOpenAICompatibleRuntime({
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model, thinking, ...rest } = payload;

      return {
        ...rest,
        model,
        ...(['thinking-vision-pro'].some((keyword) => model.toLowerCase().includes(keyword))
          ? {
              thinking:
                thinking !== undefined && thinking.type === 'enabled'
                  ? { type: 'enabled' }
                  : { type: 'disabled' },
            }
          : {}),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_VOLCENGINE_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: VolcengineModelCard[] = modelsPage.data;

    return processModelList(modelList, MODEL_LIST_CONFIGS.volcengine);
  },
  provider: ModelProvider.Volcengine,
});
