import { ModelProvider } from 'model-bank';

import {
  OpenAICompatibleFactoryOptions,
  createOpenAICompatibleRuntime,
} from '../../core/openaiCompatibleFactory';

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
  provider: ModelProvider.Wenxin,
} satisfies OpenAICompatibleFactoryOptions;

export const LobeWenxinAI = createOpenAICompatibleRuntime(params);
