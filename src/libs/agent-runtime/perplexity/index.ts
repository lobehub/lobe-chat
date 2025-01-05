import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobePerplexityAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.perplexity.ai',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      // Set a default frequency penalty value greater than 0
      const { presence_penalty, frequency_penalty, stream = true, temperature, ...res } = payload;

      let param;

      // Ensure we are only have one frequency_penalty or frequency_penalty
      if (presence_penalty !== 0) {
        param = { presence_penalty };
      } else {
        const defaultFrequencyPenalty = 1;

        param = { frequency_penalty: frequency_penalty || defaultFrequencyPenalty };
      }

      return {
        ...res,
        ...param,
        stream,
        temperature: temperature >= 2 ? undefined : temperature,
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_PERPLEXITY_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Perplexity,
});
