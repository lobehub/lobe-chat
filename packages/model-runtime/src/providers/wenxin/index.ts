import { ModelProvider } from 'model-bank';

import {
  OpenAICompatibleFactoryOptions,
  createOpenAICompatibleRuntime,
} from '../../core/openaiCompatibleFactory';
import { processMultiProviderModelList } from '../../utils/modelParse';

export interface WenxinModelCard {
  id: string;
}

export const params = {
  baseURL: 'https://qianfan.baidubce.com/v2',
  chatCompletion: {
    handlePayload: (payload) => {
      const { enabledSearch, ...rest } = payload;

      return {
        ...rest,
        stream: true,
        ...(enabledSearch && {
          web_search: {
            enable: true,
            enable_citation: true,
            enable_trace: true,
          },
        }),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_WENXIN_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: WenxinModelCard[] = modelsPage.data;

    const standardModelList = modelList.map((model) => ({
      id: model.id,
    }));

    return processMultiProviderModelList(standardModelList, 'wenxin');
  },
  provider: ModelProvider.Wenxin,
} satisfies OpenAICompatibleFactoryOptions;

export const LobeWenxinAI = createOpenAICompatibleRuntime(params);
