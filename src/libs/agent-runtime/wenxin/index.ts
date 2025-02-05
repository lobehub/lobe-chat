import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeWenxinAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://qianfan.baidubce.com/v2',
  debug: {
    chatCompletion: () => process.env.DEBUG_WENXIN_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Wenxin,
});
