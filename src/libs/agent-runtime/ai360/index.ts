import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeAi360AI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.360.cn/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_AI360_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Ai360,
});
