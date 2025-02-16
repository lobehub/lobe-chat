import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeSambaNovaAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.sambanova.ai/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_SAMBANOVA_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.SambaNova,
});
