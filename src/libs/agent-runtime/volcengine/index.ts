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
    createChatCompletionStream: (_unused, payload, instance) => {
      const customClient = new OpenAI({
        ...instance._options,
        baseURL: payload.model && payload.model.startsWith('bot-')
          ? 'https://ark.cn-beijing.volces.com/api/v3/bots'
          : 'https://ark.cn-beijing.volces.com/api/v3',
      });

      const response = customClient.chat.completions.create(
        {
          ...payload,
          stream: payload.stream ?? true,
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
