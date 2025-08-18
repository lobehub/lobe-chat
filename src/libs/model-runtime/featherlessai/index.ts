import { ModelProvider } from '@/libs/model-runtime';
import { createOpenAICompatibleRuntime } from '@/libs/model-runtime/utils/openaiCompatibleFactory';

export const LobeFeatherlessAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.featherless.ai/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_FEATHERLESSAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.FeatherlessAI,
});
