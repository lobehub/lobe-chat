import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeSenseNovaAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.sensenova.cn/compatible-mode/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { frequency_penalty, temperature, top_p, ...rest } = payload;

      return {
        ...rest,
        frequency_penalty: (frequency_penalty !== undefined && frequency_penalty > 0 && frequency_penalty <= 2) ? frequency_penalty : undefined,
        temperature: (temperature !== undefined && temperature > 0 && temperature <= 2) ? temperature : undefined,
        top_p: (top_p !== undefined && top_p > 0 && top_p < 1) ? top_p : undefined,
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    }
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_SENSENOVA_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.SenseNova,
});
