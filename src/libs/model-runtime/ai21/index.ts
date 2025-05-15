import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeAi21AI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.ai21.com/studio/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_AI21_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Ai21,
});
