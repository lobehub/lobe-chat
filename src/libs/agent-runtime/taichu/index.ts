import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeTaichuAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ai-maas.wair.ac.cn/maas/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_TAICHU_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Taichu,
});
