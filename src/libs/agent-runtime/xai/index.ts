import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeXAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.x.ai/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_XAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.XAI,
});
