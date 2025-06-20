import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export const LobeVercelAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.v0.dev/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_VERCEL_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Vercel,
});
