import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeXverseAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.xverse.cn/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_XVERSE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Xverse,
});
