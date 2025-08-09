import { ModelProvider } from '../types';
import { MODEL_LIST_CONFIGS, processModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

const THINKING_MODELS = [
  'thinking-vision-pro',
  'thinking-pro-m',
  'doubao-seed-1-6',
  'doubao-1-5-ui-tars',
];

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
        ...(THINKING_MODELS.some((keyword) => model.toLowerCase().includes(keyword))
          ? {
              thinking: { type: thinking?.type },
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

    return processModelList(modelList, MODEL_LIST_CONFIGS.volcengine, 'volcengine');
  },
  provider: ModelProvider.Volcengine,
});
