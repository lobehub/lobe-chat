import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeZhipuAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  chatCompletion: {
    handlePayload: ({ temperature, ...payload }: ChatStreamPayload) =>
      ({
        ...payload,
        do_sample: temperature === 0,
        stream: true,
        temperature,
      }) as OpenAI.ChatCompletionCreateParamsStreaming,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_ZHIPU_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.ZhiPu,
});
