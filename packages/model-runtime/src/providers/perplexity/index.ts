import { ModelProvider } from 'model-bank';
import OpenAI from 'openai';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { resolveParameters } from '../../core/parameterResolver';
import { ChatStreamPayload } from '../../types';

export const LobePerplexityAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.perplexity.ai',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { presence_penalty, frequency_penalty, stream = true, temperature, searchContextSize, ...res } = payload;

      // Resolve parameters with constraints
      const resolvedParams = resolveParameters(
        {
          frequency_penalty: presence_penalty !== 0 ? undefined : frequency_penalty || 1,
          presence_penalty: presence_penalty !== 0 ? presence_penalty : undefined,
          temperature,
        },
        {
          normalizeTemperature: false,
        },
      );

      // Perplexity doesn't support temperature >= 2
      const finalTemperature =
        resolvedParams.temperature !== undefined && resolvedParams.temperature >= 2
          ? undefined
          : resolvedParams.temperature;

      // Map searchContextSize to search_context_size for Perplexity API
      const web_search_options: any = {};
      if (searchContextSize) {
        const contextSizeMap = {
          low: 5,
          medium: 10,
          high: 20,
        };
        web_search_options.search_context_size = contextSizeMap[searchContextSize];
      }

      return {
        ...res,
        frequency_penalty: resolvedParams.frequency_penalty,
        presence_penalty: resolvedParams.presence_penalty,
        stream,
        temperature: finalTemperature,
        ...(Object.keys(web_search_options).length > 0 && { web_search_options }),
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_PERPLEXITY_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Perplexity,
});
