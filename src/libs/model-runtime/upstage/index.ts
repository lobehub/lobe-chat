import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeUpstageAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.upstage.ai/v1/solar',
  debug: {
    chatCompletion: () => process.env.DEBUG_UPSTAGE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Upstage,
});
