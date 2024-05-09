import OpenAI from 'openai';

import { AgentRuntimeErrorType } from '../error';
import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobePerplexityAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.perplexity.ai',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      // Set a default frequency penalty value greater than 0
      const defaultFrequencyPenalty = 1;

      return {
        ...payload,
        frequency_penalty: payload.frequency_penalty || defaultFrequencyPenalty,
        stream: true,
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_PERPLEXITY_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.PerplexityBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidPerplexityAPIKey,
  },
  provider: ModelProvider.Perplexity,
});
