import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeTaichuAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ai-maas.wair.ac.cn/maas/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { temperature, top_p, ...rest } = payload;

      return {
        ...rest,
        temperature: temperature !== undefined ? Math.max(temperature / 2, 0.01) : undefined,
        top_p: top_p !== undefined ? Math.min(9.9, Math.max(top_p / 2, 0.1)) : undefined,
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_TAICHU_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Taichu,
});
