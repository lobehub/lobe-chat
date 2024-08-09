import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeFireworksAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.fireworks.ai/inference/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_FIREWORKSAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.FireworksAI,
});
