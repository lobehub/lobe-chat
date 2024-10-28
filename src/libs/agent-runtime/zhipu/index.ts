import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeZhipuAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  chatCompletion: {
    handlePayload: ({ temperature, ...payload }: ChatStreamPayload) =>
      ({
        ...payload,
        stream: true,
        ...(model === "glm-4-alltools" ? {
          temperature: temperature 
            ? Math.max(0.01, Math.min(0.99, temperature / 2)) 
            : undefined,
          top_p: top_p 
            ? Math.max(0.01, Math.min(0.99, top_p)) 
            : undefined,
        } : {
          temperature: temperature !== undefined 
            ? temperature / 2
            : undefined,
        }),
      }) as OpenAI.ChatCompletionCreateParamsStreaming,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_ZHIPU_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.ZhiPu,
});
