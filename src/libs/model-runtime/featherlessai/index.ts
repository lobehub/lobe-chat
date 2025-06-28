import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export const LobeFeatherlessAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.featherless.ai/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_FEATHERLESSAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.FeatherlessAI,
});
