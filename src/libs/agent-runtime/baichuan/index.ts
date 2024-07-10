import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeBaichuanAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.baichuan-ai.com/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { frequency_penalty, ...rest } = payload;

      let adjustedFrequencyPenalty = frequency_penalty ?? 1;

      if (frequency_penalty !== undefined) {
        if (frequency_penalty < 1) {
          // If less than 1 (including negative values), add 1 to bring it into the 1-2 range
          adjustedFrequencyPenalty = Math.min(Math.max(frequency_penalty + 1, 1), 2);
        } else if (frequency_penalty > 2) {
          // If greater than 2, cap it at 2
          adjustedFrequencyPenalty = 2;
        }
        // If between 1 and 2, keep the original value
      }

      return { ...rest, frequency_penalty: adjustedFrequencyPenalty } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_BAICHUAN_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Baichuan,
});
