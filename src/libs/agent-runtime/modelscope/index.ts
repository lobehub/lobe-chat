import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeModelScopeAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api-inference.modelscope.cn/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_MODELSCOPE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.ModelScope,
});
