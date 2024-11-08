import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeStepfunAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.stepfun.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_STEPFUN_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Stepfun,
});
