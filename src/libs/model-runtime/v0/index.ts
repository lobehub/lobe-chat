import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export const LobeV0AI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.v0.dev/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_V0_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.V0,
});
