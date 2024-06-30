import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeBaichuanAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.baichuan-ai.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_BAICHUAN_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Baichuan,
});
