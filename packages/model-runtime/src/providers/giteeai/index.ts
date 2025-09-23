import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { processMultiProviderModelList } from '../../utils/modelParse';

export interface GiteeAIModelCard {
  id: string;
}

export const LobeGiteeAI = createOpenAICompatibleRuntime({
  baseURL: 'https://ai.gitee.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_GITEE_AI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: GiteeAIModelCard[] = modelsPage.data;

    return await processMultiProviderModelList(modelList, 'giteeai');
  },
  provider: ModelProvider.GiteeAI,
});
