import volcengineAllModels from '@/config/aiModels/volcengine';

import { ModelProvider } from '../types';
import { MODEL_LIST_CONFIGS, processModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { createVolcengineImage } from './createImage';

const THINKING_MODELS = [
  'thinking-vision-pro',
  'thinking-pro-m',
  'doubao-seed-1-6',
  'doubao-1-5-ui-tars',
  'deepseek-v3-1',
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
  createImage: createVolcengineImage,
  debug: {
    chatCompletion: () => process.env.DEBUG_VOLCENGINE_CHAT_COMPLETION === '1',
  },
  models: async () => {
    // Ark v3 并未提供 OpenAI 兼容的 /models 列表接口，直接使用本地配置
    const modelList: VolcengineModelCard[] = volcengineAllModels.map((m) => ({ id: m.id }));

    return processModelList(modelList, MODEL_LIST_CONFIGS.volcengine, 'volcengine');
  },
  provider: ModelProvider.Volcengine,
});
