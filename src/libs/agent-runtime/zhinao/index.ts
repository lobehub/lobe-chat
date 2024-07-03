import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeZhinaoAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ai.360.cn/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_ZHINAO_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Zhinao,
});
