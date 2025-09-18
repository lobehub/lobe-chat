import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { ModelProvider } from '../../types';
import { MODEL_LIST_CONFIGS, processModelList } from '../../utils/modelParse';

export interface ZeroOneModelCard {
  id: string;
}

export const LobeZeroOneAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.lingyiwanwu.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_ZEROONE_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: ZeroOneModelCard[] = modelsPage.data;

    return processModelList(modelList, MODEL_LIST_CONFIGS.zeroone);
  },
  provider: ModelProvider.ZeroOne,
});
