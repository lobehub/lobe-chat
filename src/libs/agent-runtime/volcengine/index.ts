import OpenAI from 'openai';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { convertIterableToStream } from '../utils/streams';

export const LobeVolcengineAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  chatCompletion: {
    handlePayload: ({ model, ...payload }) =>
      ({
        ...payload,
        model,
      }) as any,
  },
  customClient: {
    createChatCompletionStream: (client, payload, instance) => {
      
      if (payload.model && payload.model.startsWith('bot-')) {
        client.baseURL = 'https://ark.cn-beijing.volces.com/api/v3/bots';
      } else {
        client.baseURL = 'https://ark.cn-beijing.volces.com/api/v3';
      }

      const response = client.chat.completions.create(
        {
          ...payload,
          stream: payload.stream ?? true,
        },
        {
          headers: instance._options?.requestHeaders,
          signal: instance._options?.signal,
        },
      );

      return convertIterableToStream(response);
    },
    createClient: (initOptions) => {
      return new OpenAI(initOptions);
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_DOUBAO_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Volcengine,
});
