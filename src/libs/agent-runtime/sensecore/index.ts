import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeSenseCoreAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.sensenova.cn/compatible-mode/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_SENSECORE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.SenseCore,
});
