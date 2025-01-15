import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeLMStudioAI = LobeOpenAICompatibleFactory({
  apiKey: 'placeholder-to-avoid-error',
  baseURL: 'http://localhost:1234/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_LMSTUDIO_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.LMStudio,
});
